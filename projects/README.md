# 🚀 Portfolio Projects Collection

Esta coleção contém projetos intermediários e criativos desenvolvidos em diferentes tecnologias, demonstrando habilidades avançadas em desenvolvimento web e backend.

## 📁 Estrutura dos Projetos

### 🌐 HTML Projects

#### 1. Interactive Resume Builder
**Localização:** `html/interactive-resume-builder/`

**Descrição:** Um construtor de currículo dinâmico com funcionalidades avançadas de drag-and-drop, preview em tempo real e exportação para PDF.

**Características:**
- ✨ Interface drag-and-drop para reorganizar seções
- 👁️ Preview em tempo real do currículo
- 💾 Persistência local com localStorage
- 📄 Exportação para PDF e HTML
- 📱 Design responsivo
- ♿ Recursos de acessibilidade

**Tecnologias:** HTML5, CSS3, JavaScript, Web APIs

**Como executar:**
```bash
# Abra o arquivo index.html em um navegador
open html/interactive-resume-builder/index.html
```

---

### 🎨 CSS Projects

#### 1. Advanced Animation Library
**Localização:** `css/advanced-animation-library/`

**Descrição:** Uma biblioteca abrangente de animações CSS com transformações 3D, keyframes complexos e efeitos interativos.

**Características:**
- 🎯 Rotação de cubo 3D
- 🔄 Formas que se transformam (morphing)
- 💥 Sistema de partículas
- 🌊 Animações líquidas
- ⚡ Efeitos glitch
- 🧲 Hover magnético
- 📱 Otimizado para performance
- ♿ Suporte a prefers-reduced-motion

**Tecnologias:** CSS3, JavaScript, Transformações 3D, Keyframes

**Como executar:**
```bash
# Abra o arquivo index.html em um navegador
open css/advanced-animation-library/index.html
```

---

### ⚡ JavaScript Projects

#### 1. Real-time Collaborative Editor
**Localização:** `javascript/real-time-collaborative-editor/`

**Descrição:** Um editor colaborativo em tempo real com sincronização WebSocket, resolução de conflitos e transformação operacional.

**Características:**
- 🔄 Sincronização em tempo real
- 👥 Suporte multi-usuário
- 🔧 Resolução automática de conflitos
- 📝 Histórico de versões
- 💾 Suporte offline
- 🎯 Multi-cursor
- 📊 Estatísticas de texto
- 🎨 Formatação de texto

**Tecnologias:** JavaScript ES6+, WebSockets, IndexedDB, Web Workers

**Como executar:**
```bash
# Abra o arquivo index.html em um navegador
open javascript/real-time-collaborative-editor/index.html
```

---

### ☕ Java Projects

#### 1. E-commerce Platform Backend
**Localização:** `java/ecommerce-platform-backend/`

**Descrição:** Backend completo de e-commerce com processamento de pagamentos, gerenciamento de inventário e analytics em tempo real.

**Características:**
- 🛒 Gerenciamento completo de produtos
- 💳 Integração com pagamentos
- 📊 Analytics em tempo real
- 🔐 Autenticação e autorização
- 📦 Controle de inventário
- 🚀 Cache para performance
- 📈 Processamento assíncrono
- 📖 Documentação Swagger

**Tecnologias:** Spring Boot, JPA, Redis, PostgreSQL, RabbitMQ

**Como executar:**
```bash
# Compile e execute o projeto Spring Boot
./mvnw spring-boot:run

# Acesse a documentação da API
open http://localhost:8080/swagger-ui.html
```

---

### 🐍 Python Projects

#### 1. AI-Powered Content Analyzer
**Localização:** `python/ai-content-analyzer/`

**Descrição:** Sistema inteligente de análise de conteúdo usando NLP, análise de sentimentos e geração automatizada de conteúdo.

**Características:**
- 🧠 Processamento de linguagem natural
- 😊 Análise de sentimentos (VADER + TextBlob)
- 🏷️ Reconhecimento de entidades nomeadas
- 📝 Sumarização automática de texto
- 🔍 Detecção de tópicos
- 📊 Análise de legibilidade
- ⚡ Processamento em tempo real
- 🗄️ Integração com PostgreSQL e Redis

**Tecnologias:** FastAPI, NLTK, spaCy, TextBlob, PostgreSQL, Redis

**Como executar:**
```bash
# Instale as dependências
pip install -r requirements.txt

# Execute o servidor
python main.py

# Acesse a API
open http://localhost:8000/docs
```

---

### 🍃 Spring Boot Projects

#### 1. Real-time Chat Application
**Localização:** `spring-boot/real-time-chat-application/`

**Descrição:** Aplicação de chat escalável com suporte WebSocket, filas de mensagens, presença de usuário e compartilhamento de arquivos.

**Características:**
- 💬 Mensagens em tempo real
- 👥 Presença de usuários
- 📁 Compartilhamento de arquivos
- 🔒 Mensagens privadas e em grupo
- 📱 Notificações push
- 🎭 Indicadores de digitação
- 😍 Reações a mensagens
- 🗑️ Exclusão de mensagens
- 📊 Analytics de chat

**Tecnologias:** Spring Boot, WebSocket, RabbitMQ, Redis, MongoDB

**Como executar:**
```bash
# Compile e execute o projeto Spring Boot
./mvnw spring-boot:run

# Acesse a interface web
open http://localhost:8080

# WebSocket endpoint
ws://localhost:8080/ws/chat
```

---

## 🛠️ Configuração do Ambiente

### Pré-requisitos Gerais

- **Node.js** 16+ (para projetos JavaScript)
- **Java** 17+ (para projetos Java/Spring Boot)
- **Python** 3.8+ (para projetos Python)
- **Maven** 3.6+ (para projetos Java)
- **PostgreSQL** 13+ (para projetos com banco de dados)
- **Redis** 6+ (para cache)
- **RabbitMQ** 3.8+ (para filas de mensagens)

### Configuração de Banco de Dados

```sql
-- PostgreSQL setup para projetos Python/Java
CREATE DATABASE content_analyzer;
CREATE DATABASE ecommerce_platform;
CREATE DATABASE chat_application;

-- Criar usuário
CREATE USER dev_user WITH PASSWORD 'dev_password';
GRANT ALL PRIVILEGES ON DATABASE content_analyzer TO dev_user;
GRANT ALL PRIVILEGES ON DATABASE ecommerce_platform TO dev_user;
GRANT ALL PRIVILEGES ON DATABASE chat_application TO dev_user;
```

### Configuração do Redis

```bash
# Instalar Redis
brew install redis  # macOS
sudo apt install redis-server  # Ubuntu

# Iniciar Redis
redis-server
```

### Configuração do RabbitMQ

```bash
# Instalar RabbitMQ
brew install rabbitmq  # macOS
sudo apt install rabbitmq-server  # Ubuntu

# Iniciar RabbitMQ
rabbitmq-server
```

---

## 🚀 Deploy e Produção

### Docker Support

Cada projeto inclui configurações para containerização:

```bash
# Exemplo para projeto Python
docker build -t ai-content-analyzer .
docker run -p 8000:8000 ai-content-analyzer

# Exemplo para projeto Spring Boot
docker build -t chat-application .
docker run -p 8080:8080 chat-application
```

### Variáveis de Ambiente

```bash
# Exemplo de .env para projetos
DATABASE_URL=postgresql://user:password@localhost/dbname
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-secret-key
API_KEY=your-api-key
```

---

## 📊 Métricas e Monitoramento

### Logs Estruturados
- Todos os projetos implementam logging estruturado
- Níveis de log configuráveis
- Rastreamento de performance

### Health Checks
- Endpoints `/health` em todos os serviços
- Verificação de dependências (DB, Redis, etc.)
- Métricas de sistema

### Analytics
- Rastreamento de uso em tempo real
- Métricas de performance
- Dashboards de monitoramento

---

## 🧪 Testes

### Testes Automatizados
```bash
# JavaScript
npm test

# Python
pytest

# Java
./mvnw test
```

### Cobertura de Código
- Testes unitários: 80%+
- Testes de integração: 70%+
- Testes end-to-end: 60%+

---

## 📚 Documentação

### API Documentation
- **Swagger/OpenAPI** para APIs REST
- **WebSocket** documentação para endpoints em tempo real
- **Postman Collections** para testes

### Code Documentation
- **JSDoc** para JavaScript
- **Sphinx** para Python
- **Javadoc** para Java

---

## 🤝 Contribuição

### Padrões de Código
- **ESLint** para JavaScript
- **Black** para Python
- **Checkstyle** para Java

### Git Workflow
```bash
# Feature branch
git checkout -b feature/nova-funcionalidade

# Commit com padrão conventional
git commit -m "feat: adicionar nova funcionalidade"

# Pull request
git push origin feature/nova-funcionalidade
```

---

## 📄 Licença

Todos os projetos são licenciados sob MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Suporte

Para questões ou suporte:
- 📧 Email: dev@portfolio.com
- 💬 Discord: [Link do servidor]
- 📱 Telegram: @portfolio_dev

---

**Desenvolvido com ❤️ pela equipe de desenvolvimento**
