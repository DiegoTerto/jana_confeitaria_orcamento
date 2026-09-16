import { toPng, toJpeg, toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import confetti from 'canvas-confetti';
import { ProposalData } from '../types';

export const generateFilename = (data: ProposalData, extension: string): string => {
  const sanitize = (text: string) =>
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .toLowerCase();

  const clientName = data.cliente ? sanitize(data.cliente) : 'cliente';
  const rawDate = (data.data || 'orcamento').replace(/\//g, '-');
  return `Orcamento_JanaConfeitaria_${clientName}_${rawDate}.${extension}`;
};

/**
 * Captures the proposal document in an isolated, standardized sandbox
 * ensuring 100% identical dimensions (794px Desktop A4 standard) across Mobile, Tablet, and Desktop.
 */
async function captureStandardizedProposal(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  quality = 0.96
): Promise<{ dataUrl: string; width: number; height: number }> {
  // 1. Wait for web fonts to load
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Ignore font loading inspection errors
  }

  // 2. Create off-screen sandbox container with fixed Desktop A4 standard width (794px)
  const sandbox = document.createElement('div');
  sandbox.id = 'export-isolated-sandbox';
  sandbox.style.position = 'fixed';
  sandbox.style.left = '0';
  sandbox.style.top = '0';
  sandbox.style.width = '794px';
  sandbox.style.minWidth = '794px';
  sandbox.style.maxWidth = '794px';
  sandbox.style.minHeight = '1123px';
  sandbox.style.zIndex = '-9999';
  sandbox.style.opacity = '1';
  sandbox.style.pointerEvents = 'none';
  sandbox.style.backgroundColor = '#ffffff';
  sandbox.style.margin = '0';
  sandbox.style.padding = '0';
  sandbox.style.display = 'block';
  sandbox.style.visibility = 'visible';
  sandbox.style.overflow = 'hidden';

  // 3. Deep-clone the document node to completely isolate it from screen zoom and mobile CSS
  const clone = element.cloneNode(true) as HTMLElement;
  clone.style.transform = 'none';
  clone.style.transformOrigin = 'top left';
  clone.style.boxShadow = 'none';
  clone.style.margin = '0';
  clone.style.width = '794px';
  clone.style.minWidth = '794px';
  clone.style.maxWidth = '794px';
  clone.style.minHeight = '1123px';
  clone.style.boxSizing = 'border-box';
  clone.style.backgroundColor = '#ffffff';
  clone.style.display = 'block';
  clone.style.visibility = 'visible';

  // Remove any temporary change-highlight background classes from the clone
  const highlightedElements = clone.querySelectorAll('.bg-amber-100\\/70');
  highlightedElements.forEach((el) => {
    el.classList.remove('bg-amber-100/70', 'px-1', 'rounded');
  });

  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // 4. Inline images so html-to-image can render local/Vite assets reliably in the isolated clone
    const images = Array.from(clone.querySelectorAll('img'));
    if (images.length > 0) {
      await Promise.all(
        images.map(async (img) => {
          if (!img.src || img.src.startsWith('data:')) return;
          try {
            const response = await fetch(img.src, { mode: 'cors' });
            if (response.ok) {
              const blob = await response.blob();
              img.src = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(String(reader.result));
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              });
            }
          } catch (imageError) {
            console.warn('Não foi possível incorporar a imagem no PDF:', imageError);
          }
          await new Promise<void>((resolve) => {
            if (img.complete) resolve();
            else { img.onload = () => resolve(); img.onerror = () => resolve(); }
          });
        })
      );
    }

    // 5. Short pause to allow DOM layout calculation and font metrics settling
    await new Promise((resolve) => setTimeout(resolve, 100));

    const standardWidth = 794;
    const computedHeight = clone.offsetHeight || clone.scrollHeight || 1123;

    const captureOptions = {
      quality,
      pixelRatio: 2, // High resolution for 300 DPI print quality
      width: standardWidth,
      height: computedHeight,
      backgroundColor: '#ffffff',
      cacheBust: true,
      style: {
        transform: 'none',
        boxShadow: 'none',
        margin: '0',
        width: `${standardWidth}px`,
        minHeight: '1123px',
      },
    };

    let dataUrl: string;

    try {
      if (format === 'jpeg') {
        dataUrl = await toJpeg(clone, captureOptions);
      } else {
        dataUrl = await toPng(clone, captureOptions);
      }
    } catch (primaryError) {
      console.warn('Captura primária com toPng falhou, tentando fallback com canvas...', primaryError);
      const canvas = await toCanvas(clone, {
        ...captureOptions,
        skipFonts: true,
      });
      dataUrl = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', quality);
    }

    return {
      dataUrl,
      width: standardWidth,
      height: computedHeight,
    };
  } finally {
    // Clean up sandbox DOM container
    if (document.body.contains(sandbox)) {
      document.body.removeChild(sandbox);
    }
  }
}

/**
 * Convert base64 Data URL to a native File object for Web Share API
 */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * Convert base64 Data URL to a native Blob object for reliable mobile/desktop downloads
 */
function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export const exportToPdf = async (
  element: HTMLElement,
  data: ProposalData,
  onProgress?: (status: string) => void
): Promise<boolean> => {
  try {
    if (onProgress) onProgress('Preparando documento padronizado (Padrão Desktop A4)...');

    const { dataUrl, width, height } = await captureStandardizedProposal(element, 'png', 0.98);

    if (onProgress) onProgress('Criando arquivo PDF formatado...');

    // Standard A4 dimensions in millimeters
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210; // mm
    const pdfHeight = 297; // mm
    const calculatedHeightMm = (height * pdfWidth) / width;

    if (calculatedHeightMm <= 305) {
      // Pristine standard single A4 page fit
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, Math.min(calculatedHeightMm, pdfHeight), undefined, 'FAST');
    } else {
      // Multi-page handling for extended proposals
      let heightLeft = calculatedHeightMm;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, calculatedHeightMm, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - calculatedHeightMm;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, calculatedHeightMm, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const fileName = generateFilename(data, 'pdf');

    // On mobile, check if we can share the PDF natively
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    if (isMobile && navigator.canShare) {
      try {
        const pdfBlob = pdf.output('blob');
        const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare({ files: [pdfFile] })) {
          if (onProgress) onProgress('Abrindo menu para salvar ou compartilhar PDF...');
          await navigator.share({
            files: [pdfFile],
            title: 'Orçamento Jana Confeitaria (PDF)',
            text: `Orçamento em PDF para ${data.cliente || 'Cliente'}`,
          });

          try {
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#4F46E5', '#6366F1', '#B75234', '#F59E0B'],
            });
          } catch {}

          if (onProgress) onProgress('PDF salvo/compartilhado com sucesso!');
          return true;
        }
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          if (onProgress) onProgress('Ação cancelada.');
          return false;
        }
        console.warn('Native share do PDF falhou, usando salvamento direto:', shareErr);
      }
    }

    pdf.save(fileName);

    // Celebratory confetti animation
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#4F46E5', '#6366F1', '#B75234', '#F59E0B'],
      });
    } catch {
      // Decorative
    }

    if (onProgress) onProgress('PDF baixado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  }
};

export const exportToImage = async (
  element: HTMLElement,
  data: ProposalData,
  format: 'png' | 'jpeg' = 'png',
  onProgress?: (status: string) => void
): Promise<boolean> => {
  try {
    if (onProgress) onProgress(`Preparando imagem ${format.toUpperCase()} em alta definição (Padrão Desktop)...`);

    const { dataUrl } = await captureStandardizedProposal(element, format, 0.95);
    const fileName = generateFilename(data, format);

    // Try native Mobile Web Share API first on mobile devices (triggers native "Salvar Imagem" / "Fotos" / "Arquivos")
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
    
    if (isMobile && navigator.canShare) {
      try {
        const file = dataUrlToFile(dataUrl, fileName);
        if (navigator.canShare({ files: [file] })) {
          if (onProgress) onProgress('Abrindo menu nativo para salvar imagem no celular...');
          await navigator.share({
            files: [file],
            title: 'Orçamento Jana Confeitaria',
            text: `Orçamento para ${data.cliente || 'Cliente'}`,
          });

          // Celebratory confetti animation
          try {
            confetti({
              particleCount: 40,
              spread: 50,
              origin: { y: 0.8 },
              colors: ['#4F46E5', '#6366F1', '#B75234'],
            });
          } catch {}

          if (onProgress) onProgress('Imagem salva/compartilhada com sucesso!');
          return true;
        }
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          // User closed share modal, which is normal
          if (onProgress) onProgress('Ação cancelada.');
          return false;
        }
        console.warn('Web Share nativo não concluiu, usando download tradicional via Blob...', shareErr);
      }
    }

    // Fallback for Desktop or browsers without Web Share: Clean Blob URL download
    if (onProgress) onProgress('Salvando arquivo de imagem...');
    const blob = dataUrlToBlob(dataUrl);
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.download = fileName;
    link.href = blobUrl;
    link.target = '_self';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1500);

    // Celebratory confetti animation
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#4F46E5', '#6366F1', '#B75234'],
      });
    } catch {
      // Decorative
    }

    if (onProgress) onProgress('Imagem salva com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao exportar imagem:', error);
    throw error;
  }
};

export const formatWhatsAppText = (data: ProposalData): string => {
  const formattedHorario = data.usarHorarioManual
    ? data.horarioManual
    : `${data.horarioInicio || '00:00'} às ${data.horarioFim || '00:00'} (${data.horasAtendimento}h de atendimento)`;

  const sabores = data.saboresLista.length > 0 ? `\n🍓 *Sabores disponíveis:* ${data.saboresLista.join(', ')}` : '';
  const confeitos = data.confeitosLista.length > 0 ? `\n✨ *Confeitos inclusos:* ${data.confeitosLista.join(', ')}` : '';

  return `🎂 *PROPOSTA DE ORÇAMENTO - JANA CONFEITARIA* 🎂

👤 *Cliente:* ${data.cliente}
📅 *Data:* ${data.data}
👥 *Convidados:* ${data.convidados}
📍 *Local:* ${data.local}
⏰ *Horário:* ${formattedHorario}

📋 *O que está incluso:*
• Carrinho de brigadeiros gourmet com atendimento de ${data.horasAtendimento} horas
• Brigadeiro servido *à vontade* para todos os convidados durante o evento
• ${data.saboresQtd} sabores de brigadeiro e ${data.confeitosQtd} confeitos (até ${data.combinacoesCalculadas} combinações)
• Colheres e guardanapos descartáveis
• Atendimento profissional especializado durante todo o evento${sabores}${confeitos}

💰 *INVESTIMENTO:*
👉 *Valor Total: R$ ${data.valorTotal}*
${data.condicoesPagamento ? `💳 *Condições:* ${data.condicoesPagamento}\n` : ''}
${data.observacoes ? `ℹ️ *Observações:* ${data.observacoes}\n` : ''}
Ficamos à disposição para agendar a sua data especial! ❤️
*Jana Confeitaria* - ${data.contatoTelefone}`;
};

