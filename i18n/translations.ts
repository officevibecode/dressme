export type Language = 'pt' | 'en';

export interface Translations {
  // Header
  headerSubtitle: string;
  changeKey: string;
  poweredBy: string;
  themeDark: string;
  themeLight: string;

  // Login/API Key
  systemAccess: string;
  required: string;
  apiKeyDescription: string;
  yourApiKey: string;
  validating: string;
  validateAndEnter: string;
  getApiKey: string;
  invalidKey: string;
  enterKey: string;

  // Image Inputs
  selectPhotos: string;
  modelPhoto: string;
  topPiece: string;
  bottomPiece: string;
  generateLook: string;
  processing: string;
  requiredNote: string;
  clickToAdd: string;
  dropImageHere: string;

  // Instructions
  howItWorks: string;
  instruction1: string;
  instruction2: string;
  instruction3: string;
  instruction4: string;

  // Output
  yourLookHere: string;
  storiesFormat: string;
  loginToStart: string;
  downloadImage: string;
  downloadVideo: string;

  // Background Edit
  changeBackground: string;
  backgroundPlaceholder: string;
  apply: string;

  // Video
  generateVideo: string;
  paid: string;
  generateVideoButton: string;
  requiresPaidKey: string;
  learnMoreBilling: string;

  // Loading States
  creatingLook: string;
  updatingEnvironment: string;
  generatingVideo: string;

  // Errors
  invalidKeyError: string;
  generateError: string;
  editBackgroundError: string;
  videoError: string;
  imageConversionError: string;
}

export const translations: Record<Language, Translations> = {
  pt: {
    // Header
    headerSubtitle: 'Misture peças, crie looks e dê vida a eles.',
    changeKey: 'Trocar Chave',
    poweredBy: 'Powered by TGOO',
    themeDark: 'Mudar para modo escuro',
    themeLight: 'Mudar para modo claro',

    // Login/API Key
    systemAccess: 'Acesso ao Sistema',
    required: 'Requerido',
    apiKeyDescription: 'Insira a sua chave API do Google Gemini para ativar o DressMe.',
    yourApiKey: 'Sua Chave API:',
    validating: 'Validando...',
    validateAndEnter: 'Validar e Entrar',
    getApiKey: 'Obter chave API no Google AI Studio',
    invalidKey: 'Chave inválida ou inativa. Verifique e tente novamente.',
    enterKey: 'Por favor, insira uma chave.',

    // Image Inputs
    selectPhotos: '1. Selecione as Fotos',
    modelPhoto: 'Foto da Modelo',
    topPiece: 'Peça de Cima',
    bottomPiece: 'Peça de Baixo',
    generateLook: 'GERAR LOOK ✨',
    processing: 'Processando...',
    requiredNote: '*Modelo e pelo menos uma peça de roupa são obrigatórios.',
    clickToAdd: 'Clique para adicionar',
    dropImageHere: 'Solte a imagem aqui',

    // Instructions
    howItWorks: 'Como funciona:',
    instruction1: 'Envie uma foto de corpo inteiro da modelo.',
    instruction2: 'Envie fotos claras das roupas (fundo liso ajuda).',
    instruction3: 'A IA combinará as peças na modelo.',
    instruction4: 'Depois, você pode alterar o cenário ou criar um vídeo.',

    // Output
    yourLookHere: 'Seu look aparecerá aqui',
    storiesFormat: 'Formato 9:16 pronto para stories',
    loginToStart: 'Faça login com a API para começar',
    downloadImage: 'Baixar Imagem',
    downloadVideo: 'Baixar Vídeo',

    // Background Edit
    changeBackground: '2. Alterar Ambiente / Fundo',
    backgroundPlaceholder: 'Ex: na praia ao pôr do sol...',
    apply: 'Aplicar',

    // Video
    generateVideo: '3. Gerar Vídeo (Veo)',
    paid: 'Pago',
    generateVideoButton: 'GERAR VÍDEO DO LOOK',
    requiresPaidKey: 'Requer seleção de chave de API paga do Google Cloud.',
    learnMoreBilling: 'Saiba mais sobre faturamento.',

    // Loading States
    creatingLook: 'Criando seu look com Gemini 3 Pro...',
    updatingEnvironment: 'Atualizando o ambiente...',
    generatingVideo: 'Gerando vídeo com Veo (isso pode levar alguns minutos)...',

    // Errors
    invalidKeyError: 'Chave de API inválida ou sem permissão. Tente sair e colocar outra chave.',
    generateError: 'Ocorreu um erro ao gerar o look.',
    editBackgroundError: 'Erro ao editar fundo.',
    videoError: 'Erro ao gerar vídeo. Verifique se sua chave tem acesso ao Veo e faturamento ativado.',
    imageConversionError: 'Erro ao processar a imagem. Tente outro formato.',
  },
  en: {
    // Header
    headerSubtitle: 'Mix pieces, create looks and bring them to life.',
    changeKey: 'Change Key',
    poweredBy: 'Powered by TGOO',
    themeDark: 'Switch to dark mode',
    themeLight: 'Switch to light mode',

    // Login/API Key
    systemAccess: 'System Access',
    required: 'Required',
    apiKeyDescription: 'Enter your Google Gemini API key to activate DressMe.',
    yourApiKey: 'Your API Key:',
    validating: 'Validating...',
    validateAndEnter: 'Validate and Enter',
    getApiKey: 'Get API key at Google AI Studio',
    invalidKey: 'Invalid or inactive key. Please check and try again.',
    enterKey: 'Please enter a key.',

    // Image Inputs
    selectPhotos: '1. Select Photos',
    modelPhoto: 'Model Photo',
    topPiece: 'Top Piece',
    bottomPiece: 'Bottom Piece',
    generateLook: 'GENERATE LOOK ✨',
    processing: 'Processing...',
    requiredNote: '*Model and at least one clothing piece are required.',
    clickToAdd: 'Click to add',
    dropImageHere: 'Drop image here',

    // Instructions
    howItWorks: 'How it works:',
    instruction1: 'Upload a full-body photo of the model.',
    instruction2: 'Upload clear photos of clothes (plain background helps).',
    instruction3: 'AI will combine the pieces on the model.',
    instruction4: 'Then you can change the background or create a video.',

    // Output
    yourLookHere: 'Your look will appear here',
    storiesFormat: '9:16 format ready for stories',
    loginToStart: 'Login with API to get started',
    downloadImage: 'Download Image',
    downloadVideo: 'Download Video',

    // Background Edit
    changeBackground: '2. Change Environment / Background',
    backgroundPlaceholder: 'Ex: on the beach at sunset...',
    apply: 'Apply',

    // Video
    generateVideo: '3. Generate Video (Veo)',
    paid: 'Paid',
    generateVideoButton: 'GENERATE LOOK VIDEO',
    requiresPaidKey: 'Requires paid Google Cloud API key selection.',
    learnMoreBilling: 'Learn more about billing.',

    // Loading States
    creatingLook: 'Creating your look with Gemini 3 Pro...',
    updatingEnvironment: 'Updating environment...',
    generatingVideo: 'Generating video with Veo (this may take a few minutes)...',

    // Errors
    invalidKeyError: 'Invalid API key or no permission. Try logging out and using another key.',
    generateError: 'An error occurred while generating the look.',
    editBackgroundError: 'Error editing background.',
    videoError: 'Error generating video. Check if your key has access to Veo and billing enabled.',
    imageConversionError: 'Error processing image. Please try another format.',
  },
};

