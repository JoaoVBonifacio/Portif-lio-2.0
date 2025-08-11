 document.addEventListener('DOMContentLoaded', function () {
            // Lógica para o menu mobile
            const mobileMenuButton = document.getElementById('mobile-menu-button');
            const mobileMenu = document.getElementById('mobile-menu');
            const navLinks = document.querySelectorAll('.nav-link');
            
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
            
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (!mobileMenu.classList.contains('hidden')) {
                         mobileMenu.classList.add('hidden');
                    }
                });
            });

            // Lógica para alternar o tema (dark mode)
            const themeToggleBtnDesktop = document.getElementById('theme-toggle-desktop');
            const moonIconDesktop = document.getElementById('moon-icon-desktop');
            const sunIconDesktop = document.getElementById('sun-icon-desktop');
            const themeToggleBtnMobile = document.getElementById('theme-toggle-mobile');
            const moonIconMobile = document.getElementById('moon-icon-mobile');
            const sunIconMobile = document.getElementById('sun-icon-mobile');
            const htmlElement = document.documentElement;

            const currentTheme = localStorage.getItem('theme') || 'light';
            if (currentTheme === 'dark') {
                htmlElement.classList.add('dark');
                if (moonIconDesktop) moonIconDesktop.classList.add('hidden');
                if (sunIconDesktop) sunIconDesktop.classList.remove('hidden');
                if (moonIconMobile) moonIconMobile.classList.add('hidden');
                if (sunIconMobile) sunIconMobile.classList.remove('hidden');
            } else {
                htmlElement.classList.remove('dark');
                if (moonIconDesktop) moonIconDesktop.classList.remove('hidden');
                if (sunIconDesktop) sunIconDesktop.classList.add('hidden');
                if (moonIconMobile) moonIconMobile.classList.remove('hidden');
                if (sunIconMobile) sunIconMobile.classList.add('hidden');
            }

            function toggleTheme() {
                if (htmlElement.classList.contains('dark')) {
                    htmlElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                    if (moonIconDesktop) moonIconDesktop.classList.remove('hidden');
                    if (sunIconDesktop) sunIconDesktop.classList.add('hidden');
                    if (moonIconMobile) moonIconMobile.classList.remove('hidden');
                    if (sunIconMobile) sunIconMobile.classList.add('hidden');
                } else {
                    htmlElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                    if (moonIconDesktop) moonIconDesktop.classList.add('hidden');
                    if (sunIconDesktop) sunIconDesktop.classList.remove('hidden');
                    if (moonIconMobile) moonIconMobile.classList.add('hidden');
                    if (sunIconMobile) sunIconMobile.classList.remove('hidden');
                }
            }

            if (themeToggleBtnDesktop) {
                themeToggleBtnDesktop.addEventListener('click', toggleTheme);
            }
            if (themeToggleBtnMobile) {
                themeToggleBtnMobile.addEventListener('click', toggleTheme);
            }

            // Lógica para os modais
            const descriptionModal = document.getElementById('description-modal');
            const coverLetterModal = document.getElementById('cover-letter-modal');
            const closeButtons = document.querySelectorAll('.close-button');
            
            closeButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    descriptionModal.style.display = 'none';
                    coverLetterModal.style.display = 'none';
                });
            });

            window.addEventListener('click', (event) => {
                if (event.target == descriptionModal) {
                    descriptionModal.style.display = 'none';
                }
                if (event.target == coverLetterModal) {
                    coverLetterModal.style.display = 'none';
                }
            });

            // Lógica para filtrar projetos
            const projectTabs = document.querySelectorAll('.project-tab');
            const projectCards = document.querySelectorAll('.project-card');

            projectTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    projectTabs.forEach(t => {
                        t.classList.remove('bg-primary', 'text-white');
                        t.classList.add('bg-cardLight', 'dark:bg-cardDark', 'text-textLight', 'dark:text-textDark');
                    });
                    tab.classList.add('bg-primary', 'text-white');
                    tab.classList.remove('bg-cardLight', 'dark:bg-cardDark', 'text-textLight', 'dark:text-textDark');
                    
                    const filterText = tab.textContent.trim();
                    let filterCategory = '';

                    if (filterText === 'Projetos Web') {
                        filterCategory = 'web';
                    } else if (filterText === 'Projetos de Jogos') {
                        filterCategory = 'jogos';
                    }

                    projectCards.forEach(card => {
                        if (filterText === 'Todos' || card.getAttribute('data-category') === filterCategory) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                });
            });

            // Função para chamar a API do Gemini
            async function callGeminiAPI(prompt) {
                let chatHistory = [];
                chatHistory.push({ role: "user", parts: [{ text: prompt }] });
                const payload = { contents: chatHistory };
                const apiKey = "";
                const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
                
                let retries = 0;
                const maxRetries = 3;
                while (retries < maxRetries) {
                    try {
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(payload)
                        });
                        const result = await response.json();
                        if (result.candidates && result.candidates.length > 0 &&
                            result.candidates[0].content && result.candidates[0].content.parts &&
                            result.candidates[0].content.parts.length > 0) {
                            return result.candidates[0].content.parts[0].text;
                        }
                        return "Não foi possível gerar a resposta. Tente novamente.";
                    } catch (error) {
                        retries++;
                        await new Promise(res => setTimeout(res, 2 ** retries * 1000));
                    }
                }
                return "Ocorreu um erro ao gerar a resposta. Por favor, tente novamente mais tarde.";
            }

            // Lógica para gerar descrições detalhadas dos projetos
            const generateDescBtns = document.querySelectorAll('.generate-desc-btn');
            generateDescBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const card = btn.closest('.card');
                    const projectTitle = card.querySelector('h3').textContent;
                    const projectDesc = card.querySelector('.project-desc').textContent;
                    const techTags = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent).join(', ');

                    const modalTitle = document.getElementById('modal-title');
                    const generatedDescription = document.getElementById('generated-description');
                    const loadingSpinner = document.getElementById('loading-spinner');

                    modalTitle.textContent = `Detalhes do Projeto: ${projectTitle}`;
                    generatedDescription.textContent = '';
                    loadingSpinner.classList.remove('hidden');
                    descriptionModal.style.display = 'flex';

                    const prompt = `Gere uma descrição detalhada de estudo de caso para o seguinte projeto de portfólio. Estruture a resposta com as seções "O Problema", "A Solução", "Tecnologias Usadas" e "Resultados/Aprendizados". O texto deve ser profissional e envolvente. O projeto é sobre: "${projectTitle}". A descrição atual é: "${projectDesc}". As tecnologias são: "${techTags}".`;

                    const detailedDescription = await callGeminiAPI(prompt);
                    
                    loadingSpinner.classList.add('hidden');
                    generatedDescription.textContent = detailedDescription;
                });
            });

            // Lógica para gerar a carta de apresentação
            const generateCoverLetterBtn = document.getElementById('generate-cover-letter-btn');
            generateCoverLetterBtn.addEventListener('click', async () => {
                const coverLetterSpinner = document.getElementById('cover-letter-spinner');
                const generatedCoverLetter = document.getElementById('generated-cover-letter');
                const coverLetterContent = document.getElementById('cover-letter-content');

                coverLetterContent.classList.add('hidden');
                coverLetterSpinner.classList.remove('hidden');
                coverLetterModal.style.display = 'flex';

                const portfolioData = {
                    nome: 'João Bonifácio',
                    cargo: 'Desenvolvedor Full Stack Python',
                    resumo: 'Desenvolvedor Full Stack Python em formação pela EBAC. Com experiência em suporte técnico e uma paixão por resolver problemas complexos, busco aplicar meus conhecimentos em desenvolvimento web, de jogos e mobile para criar soluções funcionais e atraentes. Minha experiência em projetos de prazos curtos (hackathons) me deu a capacidade de integrar elementos visuais e funcionais com coesão e agilidade.',
                    habilidades: 'Desenvolvimento Web: HTML, CSS, JavaScript, Python, Django, Sistemas Web. Desenvolvimento de Jogos: Unity, C#. Desenvolvimento Mobile: React Native. Experiências Adicionais: Suporte Técnico, Instalação e Configuração de Windows Server, Manutenção de Computadores.',
                    projetos: 'Login-Register-Firebase (Sistema de autenticação com Firebase e Django); AJR Fanpage (Página web de front-end com HTML, CSS, JS); Devaneio (Jogo top-down com Unity e C#); A Space Between Us (Jogo educativo com Unity e C#).',
                    contato: 'jboni2014@gmail.com'
                };

                const prompt = `Com base nas seguintes informações de portfólio, escreva um rascunho de carta de apresentação profissional e concisa. A carta deve ser genérica o suficiente para ser usada para várias vagas, focando nas principais competências e na versatilidade do candidato. Utilize a seguinte estrutura: Saudação formal, Parágrafo de introdução (apresentação e objetivo), Parágrafo do corpo (destacando habilidades e projetos), Parágrafo de fechamento (demonstrando interesse e disponibilidade), Despedida formal.
                
                Informações do candidato:
                Nome: ${portfolioData.nome}
                Cargo Desejado: ${portfolioData.cargo}
                Resumo: ${portfolioData.resumo}
                Habilidades: ${portfolioData.habilidades}
                Projetos Relevantes: ${portfolioData.projetos}
                Contato: ${portfolioData.contato}
                `;
                
                const coverLetterText = await callGeminiAPI(prompt);
                
                coverLetterSpinner.classList.add('hidden');
                generatedCoverLetter.textContent = coverLetterText;
                coverLetterContent.classList.remove('hidden');
            });
            
            // Lógica para copiar a carta de apresentação
            const copyCoverLetterBtn = document.getElementById('copy-cover-letter-btn');
            copyCoverLetterBtn.addEventListener('click', () => {
                const text = document.getElementById('generated-cover-letter').textContent;
                const tempInput = document.createElement('textarea');
                tempInput.value = text;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                copyCoverLetterBtn.textContent = 'Copiado!';
                setTimeout(() => {
                    copyCoverLetterBtn.textContent = 'Copiar para a Área de Transferência';
                }, 2000);
            });
        });