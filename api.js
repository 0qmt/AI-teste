import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBgSNQWre-BpAYlR35jHUGzOiBlVTRzeFs";
const genAI = new GoogleGenerativeAI(API_KEY);

async function fileToGenerativePart(file) {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

export async function Gemini(input) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-1219" });

  try {
    let result1, result2;

    if (input instanceof File) {
      // Se for uma imagem
      const imagePart = await fileToGenerativePart(input);
      const prompt1 = " Responda a questao da imagem em português do brasil, verifique se a resposta esta totalmente correta, escolha uma alternativa e verifique se a alternativa é correta, faça essa verificação varias vezes";
      const prompt2 = " Responda a questao da imagem em português do brasil, verifique se a resposta esta totalmente correta, escolha uma alternativa e verifique se a alternativa é correta, faça essa verificação varias vezes";
      result1 = await model.generateContent([prompt1, imagePart]);
      result2 = await model.generateContent([prompt2, imagePart]);
    } else {
      // Se for texto
      const prompt1 = `Analise o seguinte texto e forneça uma descrição básica dos principais pontos. Se for um exercício ou questão, liste os tópicos abordados e termos de pesquisa para vídeos explicativos:

${input}

Formatação:
- Use marcadores para listar os tópicos
- Para cada termo de pesquisa, crie um link direto para a busca no YouTube
- Utilize markdown para estruturar e formatar o texto`;

      const prompt2 = `Forneça uma aula completa sobre o conteúdo do seguinte texto, incluindo teoria, conceitos-chave, exemplos e explicações detalhadas. Se for um exercício, explique como resolver questões similares:

${input}

Formatação:
- Use markdown extensivamente para estruturar o conteúdo
- Inclua títulos, subtítulos, fórmulas, listas numeradas e com marcadores
- Destaque conceitos-chave, fórmulas e passos importantes
- Adicione uma seção "CheatSheet" com todas as fórmulas e conceitos necessários`;

      result1 = await model.generateContent(prompt1);
      result2 = await model.generateContent(prompt2);
    }

    return {
      links: await result1.response.text(),
      aula: await result2.response.text()
    };
  } catch (error) {
    console.error("Erro ao processar o input:", error);
    throw error;
  }
}
