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
 * Capture an HTMLElement to a PNG or JPEG data URL with fallback mechanisms
 */
async function captureElementToDataUrl(
  element: HTMLElement,
  format: 'png' | 'jpeg' = 'png',
  quality = 0.95
): Promise<string> {
  // Ensure web fonts are fully rendered
  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch {
    // Ignore font loading inspection errors
  }

  // Small delay for DOM settling
  await new Promise((resolve) => setTimeout(resolve, 80));

  const options = {
    quality,
    pixelRatio: 2, // Crisp 2x retina/print resolution
    backgroundColor: '#ffffff',
    cacheBust: true,
    style: {
      transform: 'none',
      boxShadow: 'none',
      margin: '0',
    },
  };

  // Primary capture attempt with html-to-image
  try {
    if (format === 'jpeg') {
      return await toJpeg(element, options);
    }
    return await toPng(element, options);
  } catch (primaryError) {
    console.warn('Tentativa primária de captura falhou, tentando fallback com canvas...', primaryError);

    // Fallback attempt without remote font embeds if font fetching failed
    try {
      const canvas = await toCanvas(element, {
        ...options,
        skipFonts: true,
      });
      return canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', quality);
    } catch (fallbackError) {
      console.error('Falha no fallback de captura:', fallbackError);
      throw fallbackError;
    }
  }
}

export const exportToPdf = async (
  element: HTMLElement,
  data: ProposalData,
  onProgress?: (status: string) => void
): Promise<boolean> => {
  const originalTransform = element.style.transform;
  const originalBoxShadow = element.style.boxShadow;

  try {
    if (onProgress) onProgress('Preparando documento de alta definição...');

    // Temporarily reset CSS scale transform for pixel-perfect standard dimensions
    element.style.transform = 'none';
    element.style.boxShadow = 'none';

    if (onProgress) onProgress('Renderizando páginas em alta resolução (300 DPI)...');

    const imgData = await captureElementToDataUrl(element, 'png', 0.98);

    if (onProgress) onProgress('Criando arquivo PDF formatado...');

    // A4 format in mm: 210 mm x 297 mm
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const elementWidth = element.offsetWidth || 794;
    const elementHeight = element.offsetHeight || 1123;
    const calculatedHeightMm = (elementHeight * pdfWidth) / elementWidth;

    if (calculatedHeightMm <= 300) {
      // Single-page fit
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(calculatedHeightMm, pdfHeight), undefined, 'FAST');
    } else {
      // Multi-page handling if content exceeds single page
      let heightLeft = calculatedHeightMm;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeightMm, undefined, 'FAST');
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - calculatedHeightMm;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, calculatedHeightMm, undefined, 'FAST');
        heightLeft -= pdfHeight;
      }
    }

    const fileName = generateFilename(data, 'pdf');
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
      // Confetti is purely decorative
    }

    if (onProgress) onProgress('PDF baixado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    throw error;
  } finally {
    // Always restore element presentation
    element.style.transform = originalTransform;
    element.style.boxShadow = originalBoxShadow;
  }
};

export const exportToImage = async (
  element: HTMLElement,
  data: ProposalData,
  format: 'png' | 'jpeg' = 'png',
  onProgress?: (status: string) => void
): Promise<boolean> => {
  const originalTransform = element.style.transform;
  const originalBoxShadow = element.style.boxShadow;

  try {
    if (onProgress) onProgress(`Preparando imagem ${format.toUpperCase()} em alta definição...`);

    element.style.transform = 'none';
    element.style.boxShadow = 'none';

    if (onProgress) onProgress('Processando imagem do orçamento...');

    const dataUrl = await captureElementToDataUrl(element, format, 0.95);

    const fileName = generateFilename(data, format);

    // Trigger download
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 200);

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
  } finally {
    element.style.transform = originalTransform;
    element.style.boxShadow = originalBoxShadow;
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

