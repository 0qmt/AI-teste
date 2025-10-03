class GeminiChatbot {
    constructor() {
        this.apiKey = 'AIzaSyADxX7-1UkAA81v3QkuMR5nZoRE3X6iTxw';
        
        // Configuração dos modelos
        this.models = {
            flash: {
                name: 'gemini-2.5-flash',
                displayName: 'Gemini 2.5 Flash',
                icon: '⚡',
                description: 'Rápido e Eficiente - Ideal para respostas rápidas e chat geral',
                features: ['Baixa latência', 'Custo eficiente', 'Alto volume', 'Respostas rápidas'],
                bestFor: 'Chat geral, análise básica de imagens, respostas rápidas',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
            },
            pro: {
                name: 'gemini-2.5-pro',
                displayName: 'Gemini 2.5 Pro',
                icon: '🧠',
                description: 'Raciocínio Avançado - Ideal para tarefas complexas e análise detalhada',
                features: ['Raciocínio profundo', 'Análise complexa', 'Programação avançada', 'Contexto extenso'],
                bestFor: 'Análise complexa, código, problemas matemáticos, raciocínio avançado',
                endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent'
            }
        };

        // Configuração dos templates de prompt
        this.templates = {
            geral_br: {
                label: '🇧🇷 Geral BR',
                icon: '🇧🇷',
                name: 'Geral BR',
                doublePass: false,
                description: 'Assistente brasileiro prestativo e objetivo',
                system: 'Você é um assistente brasileiro prestativo e objetivo. Siga estritamente as instruções do usuário. Seja claro, direto e educado. Se a pergunta for ambígua, apresente 2-3 interpretações plausíveis e peça confirmação em 1 linha. Para fatos, prefira respostas verificáveis e declare suposições quando necessário. Formate listas com tópicos simples.'
            },
            estudos: {
                label: '📚 Tutor de Estudos',
                icon: '📚',
                name: 'Tutor de Estudos',
                doublePass: false,
                description: 'Especializado em educação e explicações didáticas',
                system: 'Atue como um tutor de estudos. Objetivo: Explicar conceitos com exemplos simples e analogias. Avaliar pré-requisitos e lacunas de conhecimento. Gerar plano de estudo com metas semanais e exercícios graduais. Procedimento: 1) Diagnostique o nível atual em 3-5 bullets. 2) Explique o conceito central em 5-8 frases. 3) Dê 3 exercícios (fácil/médio/difícil) com gabarito resumido. 4) Proponha um plano de 2 semanas (tarefas, materiais e tempo). 5) Liste 2-3 armadilhas comuns e como evitá-las. Mantenha respostas concisas e acionáveis.'
            },
            programacao: {
                label: '💻 Programação Sênior',
                icon: '💻',
                name: 'Programação Sênior',
                doublePass: false,
                description: 'Desenvolvimento de software com foco em qualidade',
                system: 'Aja como engenheiro de software sênior. Forneça solução idiomática, segura e performática. Inclua complexidade temporal/espacial. Proponha testes unitários mínimos e checklist de riscos. Se houver ambiguidade de requisitos, liste 2-3 interpretações e escolha a melhor, justificando. Formato: 1) Solução (código) 2) Testes (código) 3) Complexidade e trade-offs (3-5 bullets) 4) Riscos e mitigação (3 bullets)'
            },
            matematica: {
                label: '🔢 Matemática Rigorosa',
                icon: '🔢',
                name: 'Matemática Rigorosa',
                doublePass: false,
                description: 'Resolução matemática com verificação dupla',
                system: 'Resolva com rigor matemático. Defina variáveis e condições. Derive passo a passo de forma clara. Verifique por 2 métodos independentes sempre que possível (ex.: substituição numérica e prova algébrica). Alerte sobre domínios, singularidades e fronteiras. Formato: 1) Resultado final 2) Derivação resumida (até 10 linhas) 3) Verificação dupla (2 métodos) 4) Observações de domínio'
            },
            imagem: {
                label: '🖼️ Análise de Imagem',
                icon: '🖼️',
                name: 'Análise de Imagem',
                doublePass: false,
                description: 'Especializado em análise detalhada de imagens',
                system: 'Quando houver imagem: Descreva conteúdo, contexto e detalhes relevantes. Liste objetos, cores dominantes e potenciais relações. Aponte incertezas claramente. Formato: 1) Descrição 2) Itens detectados (bullets) 3) Observações e limitações'
            },
            precisao_max: {
                label: '🎯 Alta Precisão (2x Check)',
                icon: '🎯',
                name: 'Alta Precisão',
                doublePass: true,
                description: 'Verificação em duas etapas para máxima precisão',
                system: 'Otimize precisão com revisão interna. Regras: Resolva a tarefa seguindo passos numerados. Faça verificação interna por checklist: consistência lógica, unidades, limites, contraexemplos, e reformulação. Gere 2 interpretações alternativas e valide qual se aplica. Mostre ao usuário somente: Resposta final, Resumo de verificação (1-2 linhas), Alternativas consideradas (curtas). Se faltar dado, peça a informação mínima necessária.'
            }
        };
        
        this.currentModelKey = this.loadSetting('selectedModel', 'flash');
        this.currentModel = this.models[this.currentModelKey];
        this.currentTemplateKey = this.loadSetting('selectedTemplate', 'geral_br');
        this.currentTemplate = this.templates[this.currentTemplateKey];
        
        this.conversationHistory = [];
        this.currentImage = null;
        this.isConfigVisible = false;
        this.isDoubleCheckActive = false;
        
        // Personalidade padrão
        this.defaultPersonality = "Você é um assistente brasileiro muito prestativo e inteligente.";
        this.currentPersonality = this.currentTemplate.system;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setInitialTime();
        this.loadPersonality();
        this.updateModelIndicator();
        this.updateTemplateIndicator();
        this.initializeSelectors();
    }
    
    // Utilitários para localStorage
    saveSetting(key, value) {
        try {
            localStorage.setItem(`chatbot_${key}`, value);
        } catch (e) {
            console.warn('LocalStorage não disponível:', e);
        }
    }
    
    loadSetting(key, defaultValue) {
        try {
            return localStorage.getItem(`chatbot_${key}`) || defaultValue;
        } catch (e) {
            console.warn('LocalStorage não disponível:', e);
            return defaultValue;
        }
    }
    
    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.imageButton = document.getElementById('imageButton');
        this.imageInput = document.getElementById('imageInput');
        this.imagePreview = document.getElementById('imagePreview');
        this.previewImage = document.getElementById('previewImage');
        this.removeImage = document.getElementById('removeImage');
        this.loadingIndicator = document.getElementById('loadingIndicator');
        this.loadingText = document.getElementById('loadingText');
        this.clearChat = document.getElementById('clearChat');
        this.imageSource = document.getElementById('imageSource');
        
        // Elementos de personalidade
        this.toggleConfig = document.getElementById('toggleConfig');
        this.personalityConfig = document.getElementById('personalityConfig');
        this.personalityInput = document.getElementById('personalityInput');
        this.savePersonality = document.getElementById('savePersonality');
        this.resetPersonality = document.getElementById('resetPersonality');
        
        // Elementos do seletor de modelo
        this.modelSelect = document.getElementById('modelSelect');
        this.modelInfoBtn = document.getElementById('modelInfoBtn');
        this.modelInfoModal = document.getElementById('modelInfoModal');
        this.closeModelModal = document.getElementById('closeModelModal');
        this.modalModelName = document.getElementById('modalModelName');
        this.modalModelIcon = document.getElementById('modalModelIcon');
        this.modalModelDescription = document.getElementById('modalModelDescription');
        this.modalModelFeatures = document.getElementById('modalModelFeatures');
        this.modalModelBestFor = document.getElementById('modalModelBestFor');
        
        // Elementos do seletor de template
        this.templateSelect = document.getElementById('templateSelect');
        this.templateInfoBtn = document.getElementById('templateInfoBtn');
        this.templateInfoModal = document.getElementById('templateInfoModal');
        this.closeTemplateModal = document.getElementById('closeTemplateModal');
        
        // Elementos de indicação de template
        this.templateIndicator = document.getElementById('templateIndicator');
        this.currentTemplateIcon = document.getElementById('currentTemplateIcon');
        this.currentTemplateName = document.getElementById('currentTemplateName');
        
        // Elementos de verificação dupla
        this.doubleCheckIndicator = document.getElementById('doubleCheckIndicator');
        this.doubleCheckText = document.getElementById('doubleCheckText');
        this.step1 = document.getElementById('step1');
        this.step2 = document.getElementById('step2');
    }
    
    initializeSelectors() {
        // Inicializar seletores com valores salvos
        this.modelSelect.value = this.currentModelKey;
        this.templateSelect.value = this.currentTemplateKey;
    }
    
    setupEventListeners() {
        // Chat básico
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Upload de imagem
        this.imageButton.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageSelection(e));
        this.removeImage.addEventListener('click', () => this.removeSelectedImage());
        
        // Configuração e limpeza
        this.clearChat.addEventListener('click', () => this.clearConversation());
        this.toggleConfig.addEventListener('click', () => this.togglePersonalityConfig());
        this.savePersonality.addEventListener('click', () => this.savePersonalitySettings());
        this.resetPersonality.addEventListener('click', () => this.resetPersonalityToTemplate());
        
        // Seletor de modelo
        this.modelSelect.addEventListener('change', (e) => this.switchModel(e.target.value));
        this.modelInfoBtn.addEventListener('click', () => this.showModelInfo());
        this.closeModelModal.addEventListener('click', () => this.hideModelInfo());
        
        // Seletor de template
        this.templateSelect.addEventListener('change', (e) => this.switchTemplate(e.target.value));
        this.templateInfoBtn.addEventListener('click', () => this.showTemplateInfo());
        this.closeTemplateModal.addEventListener('click', () => this.hideTemplateInfo());
        
        // Fechar modais clicando no backdrop
        this.modelInfoModal.addEventListener('click', (e) => {
            if (e.target === this.modelInfoModal || e.target.classList.contains('modal-backdrop')) {
                this.hideModelInfo();
            }
        });
        
        this.templateInfoModal.addEventListener('click', (e) => {
            if (e.target === this.templateInfoModal || e.target.classList.contains('modal-backdrop')) {
                this.hideTemplateInfo();
            }
        });
        
        // Funcionalidade Ctrl+V para colar imagens
        document.addEventListener('paste', (e) => this.handlePaste(e));
        
        // Prevenir comportamento padrão de drag & drop
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }
    
    switchModel(modelKey) {
        if (this.models[modelKey]) {
            this.currentModelKey = modelKey;
            this.currentModel = this.models[modelKey];
            this.saveSetting('selectedModel', modelKey);
            this.updateModelIndicator();
            this.showNotification(`${this.currentModel.icon} Modelo alterado para ${this.currentModel.displayName}`, 'success');
        }
    }
    
    switchTemplate(templateKey) {
        if (this.templates[templateKey]) {
            this.currentTemplateKey = templateKey;
            this.currentTemplate = this.templates[templateKey];
            this.currentPersonality = this.currentTemplate.system;
            this.saveSetting('selectedTemplate', templateKey);
            this.updateTemplateIndicator();
            this.updatePersonalityTextarea();
            this.showNotification(`${this.currentTemplate.icon} Template alterado para ${this.currentTemplate.name}`, 'info');
        }
    }
    
    updateModelIndicator() {
        // Atualizar o texto de carregamento para refletir o modelo atual
        this.loadingText.textContent = `${this.currentModel.icon} Processando com ${this.currentModel.displayName}...`;
    }
    
    updateTemplateIndicator() {
        this.currentTemplateIcon.textContent = this.currentTemplate.icon;
        this.currentTemplateName.textContent = this.currentTemplate.name;
    }
    
    updatePersonalityTextarea() {
        if (this.personalityInput) {
            this.personalityInput.value = this.currentPersonality;
        }
    }
    
    showNotification(message, type = 'success') {
        // Criar notificação
        const notification = document.createElement('div');
        notification.className = `status status--${type} notification`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s var(--ease-standard)';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    showModelInfo() {
        const model = this.currentModel;
        
        // Atualizar conteúdo do modal
        this.modalModelName.textContent = model.displayName;
        this.modalModelIcon.textContent = model.icon;
        this.modalModelDescription.textContent = model.description;
        this.modalModelBestFor.textContent = model.bestFor;
        
        // Limpar e popular lista de features
        this.modalModelFeatures.innerHTML = '';
        model.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            this.modalModelFeatures.appendChild(li);
        });
        
        // Mostrar modal
        this.modelInfoModal.classList.remove('hidden');
    }
    
    hideModelInfo() {
        this.modelInfoModal.classList.add('hidden');
    }
    
    showTemplateInfo() {
        this.templateInfoModal.classList.remove('hidden');
    }
    
    hideTemplateInfo() {
        this.templateInfoModal.classList.add('hidden');
    }
    
    async handlePaste(event) {
        const items = Array.from(event.clipboardData.items);
        const imageItem = items.find(item => item.type.startsWith('image/'));
        
        if (imageItem) {
            event.preventDefault();
            const file = imageItem.getAsFile();
            if (file) {
                await this.processImageFile(file, '📋 Imagem colada (Ctrl+V)');
            }
        }
    }
    
    async handleImageSelection(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        await this.processImageFile(file, '📷 Imagem selecionada');
    }
    
    async processImageFile(file, source) {
        // Verificar tipo de arquivo
        const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
        if (!supportedTypes.includes(file.type)) {
            this.showError('Tipo de imagem não suportado. Use JPEG, PNG, WEBP, GIF ou BMP.');
            return;
        }
        
        // Verificar tamanho (20MB)
        if (file.size > 20 * 1024 * 1024) {
            this.showError('Imagem muito grande. Máximo 20MB.');
            return;
        }
        
        try {
            const base64 = await this.convertToBase64(file);
            this.currentImage = {
                data: base64.split(',')[1], // Remove o prefixo data:image/...;base64,
                mimeType: file.type
            };
            
            this.previewImage.src = base64;
            this.imageSource.textContent = source;
            this.imagePreview.classList.remove('hidden');
            
            // Auto scroll para mostrar o preview
            this.scrollToBottom();
        } catch (error) {
            this.showError('Erro ao processar imagem.');
            console.error('Erro ao converter imagem:', error);
        }
    }
    
    convertToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    removeSelectedImage() {
        this.currentImage = null;
        this.imagePreview.classList.add('hidden');
        this.imageInput.value = '';
    }
    
    togglePersonalityConfig() {
        this.isConfigVisible = !this.isConfigVisible;
        this.personalityConfig.classList.toggle('hidden', !this.isConfigVisible);
        
        // Atualizar texto do botão
        this.toggleConfig.textContent = this.isConfigVisible ? '❌ Fechar' : '⚙️ Config';
        
        if (this.isConfigVisible) {
            this.personalityInput.focus();
        }
    }
    
    loadPersonality() {
        this.personalityInput.value = this.currentPersonality;
    }
    
    savePersonalitySettings() {
        const newPersonality = this.personalityInput.value.trim();
        if (newPersonality) {
            this.currentPersonality = newPersonality;
            this.showNotification('✅ Personalidade salva com sucesso!', 'success');
        } else {
            this.showNotification('⚠️ Digite uma personalidade válida.', 'warning');
        }
    }
    
    resetPersonalityToTemplate() {
        this.currentPersonality = this.currentTemplate.system;
        this.personalityInput.value = this.currentTemplate.system;
        this.showNotification(`🔄 Personalidade resetada para template ${this.currentTemplate.name}.`, 'info');
    }
    
    setInitialTime() {
        const initialTimeElement = document.getElementById('initialTime');
        if (initialTimeElement) {
            initialTimeElement.textContent = this.formatTime(new Date());
        }
    }
    
    formatTime(date) {
        return date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message && !this.currentImage) {
            return;
        }
        
        // Desabilitar entrada enquanto processa
        this.toggleInputs(false);
        
        // Adicionar mensagem do usuário
        this.addUserMessage(message, this.currentImage);
        
        // Limpar entrada
        this.messageInput.value = '';
        const imageToSend = this.currentImage;
        this.removeSelectedImage();
        
        // Verificar se deve usar verificação dupla
        if (this.currentTemplate.doublePass) {
            await this.processDoublePassMessage(message, imageToSend);
        } else {
            await this.processSinglePassMessage(message, imageToSend);
        }
        
        this.toggleInputs(true);
        this.scrollToBottom();
        this.messageInput.focus();
    }
    
    async processSinglePassMessage(message, image) {
        this.showLoading(true);
        
        try {
            const response = await this.callGeminiAPI(message, image);
            this.addAIMessage(response);
        } catch (error) {
            this.showError(`❌ Erro ao se comunicar com ${this.currentModel.displayName}. Tente novamente.`);
            console.error('Erro na API:', error);
        } finally {
            this.showLoading(false);
        }
    }
    
    async processDoublePassMessage(message, image) {
        this.showDoubleCheckIndicator(true);
        
        try {
            // Primeira etapa: rascunho
            this.updateDoubleCheckStep(1);
            const draftPrompt = `ETAPA 1 - RASCUNHO: ${message}`;
            const draft = await this.callGeminiAPI(draftPrompt, image);
            
            // Segunda etapa: verificação
            this.updateDoubleCheckStep(2);
            const verificationPrompt = `ETAPA 2 - VERIFICAÇÃO: Revise e melhore este rascunho aplicando checklist rigoroso de precisão. RASCUNHO: ${draft}\n\nUSUÁRIO ORIGINAL: ${message}`;
            const finalResponse = await this.callGeminiAPI(verificationPrompt, null); // Não enviar imagem novamente
            
            this.addAIMessage(finalResponse, true); // Indicar que foi verificado
        } catch (error) {
            this.showError(`❌ Erro na verificação dupla com ${this.currentModel.displayName}. Tente novamente.`);
            console.error('Erro na verificação dupla:', error);
        } finally {
            this.showDoubleCheckIndicator(false);
        }
    }
    
    showDoubleCheckIndicator(show) {
        this.isDoubleCheckActive = show;
        this.doubleCheckIndicator.classList.toggle('hidden', !show);
        if (show) {
            this.step1.classList.remove('active', 'completed');
            this.step2.classList.remove('active', 'completed');
        }
    }
    
    updateDoubleCheckStep(step) {
        if (step === 1) {
            this.step1.classList.add('active');
            this.step2.classList.remove('active');
            this.doubleCheckText.textContent = '🎯 Gerando rascunho inicial...';
        } else if (step === 2) {
            this.step1.classList.remove('active');
            this.step1.classList.add('completed');
            this.step2.classList.add('active');
            this.doubleCheckText.textContent = '🎯 Verificando e refinando resposta...';
        }
    }
    
    async callGeminiAPI(message, image) {
        const parts = [];
        
        // Adicionar personalidade como contexto do sistema
        if (this.currentPersonality) {
            parts.push({ text: `[SISTEMA]: ${this.currentPersonality}\n\n[USUÁRIO]: ` });
        }
        
        if (message) {
            parts.push({ text: message });
        }
        
        if (image) {
            parts.push({
                inline_data: {
                    mime_type: image.mimeType,
                    data: image.data
                }
            });
        }
        
        const requestBody = {
            contents: [{
                parts: parts
            }],
            generationConfig: {
                temperature: 0.8,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 8192,
            }
        };
        
        // Usar o endpoint do modelo atual
        const response = await fetch(`${this.currentModel.endpoint}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }
        
        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Resposta inválida da API');
        }
        
        return data.candidates[0].content.parts[0].text;
    }
    
    addUserMessage(text, image) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '👤';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        if (image) {
            const imageElement = document.createElement('img');
            imageElement.src = `data:${image.mimeType};base64,${image.data}`;
            imageElement.className = 'message-image';
            imageElement.alt = 'Imagem enviada';
            content.appendChild(imageElement);
        }
        
        if (text) {
            const textDiv = document.createElement('div');
            textDiv.className = 'message-text';
            textDiv.textContent = text;
            content.appendChild(textDiv);
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());
        content.appendChild(timeDiv);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addAIMessage(text, wasVerified = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = this.currentModel.icon;
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.innerHTML = this.formatMarkdown(text);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        
        // Criar badge do template
        const templateBadge = document.createElement('span');
        templateBadge.className = 'message-template-badge';
        templateBadge.innerHTML = `${this.currentTemplate.icon} ${this.currentTemplate.name}${wasVerified ? ' ✓✓' : ''}`;
        
        timeDiv.innerHTML = `${this.formatTime(new Date())} • ${this.currentModel.displayName}`;
        timeDiv.appendChild(templateBadge);
        
        content.appendChild(textDiv);
        content.appendChild(timeDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    formatMarkdown(text) {
        // Suporte melhorado ao markdown
        let formatted = text;
        
        // Negrito
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
        
        // Itálico
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
        
        // Código inline
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Quebras de linha
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Listas simples
        formatted = formatted.replace(/^- (.*$)/gim, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Links simples
        formatted = formatted.replace(/https?:\/\/[^\s]+/g, '<a href="$&" target="_blank">$&</a>');
        
        return formatted;
    }
    
    showError(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = '⚠️';
        
        const content = document.createElement('div');
        content.className = 'message-content error-message';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = message;
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(new Date());
        
        content.appendChild(textDiv);
        content.appendChild(timeDiv);
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showLoading(show) {
        this.loadingIndicator.classList.toggle('hidden', !show);
    }
    
    toggleInputs(enabled) {
        this.messageInput.disabled = !enabled;
        this.sendButton.disabled = !enabled;
        this.imageButton.disabled = !enabled;
        this.imageInput.disabled = !enabled;
        this.modelSelect.disabled = !enabled;
        this.templateSelect.disabled = !enabled;
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 50);
    }
    
    clearConversation() {
        // Manter apenas a mensagem inicial
        const messages = this.chatMessages.querySelectorAll('.message');
        for (let i = 1; i < messages.length; i++) {
            messages[i].remove();
        }
        
        this.conversationHistory = [];
        this.removeSelectedImage();
        this.showLoading(false);
        this.showDoubleCheckIndicator(false);
        this.messageInput.focus();
    }
}

// Inicializar o chatbot quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new GeminiChatbot();
    
    // Focar no input após carregar
    setTimeout(() => {
        chatbot.messageInput.focus();
    }, 100);
    
    console.log('🤖 Chatbot Gemini Avançado inicializado!');
    console.log('✨ Funcionalidades: Templates, Verificação Dupla, Upload, Ctrl+V, Configurações');
    console.log(`🔥 Modelo atual: ${chatbot.currentModel.displayName}`);
    console.log(`📋 Template atual: ${chatbot.currentTemplate.name}`);
});
