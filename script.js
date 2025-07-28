// Configuração das planilhas do Google Sheets
// IMPORTANTE: Substitua estas URLs pelas URLs das suas planilhas publicadas como CSV
const SHEET_URLS = {
    0: 'https://docs.google.com/spreadsheets/d/1QIgG7oeHhyIrdlzWAb5jv3Ru_305UJ0xoZniGgQGP9M/export?format=csv&gid=0', // iPhones
    1: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHdgSqrc0KGJart9S6e3Zfy6P8xlcqG0oUy8j34Hx0kFcNPOyTklbKmqOZlibIYKbscOLWf6ycNDd4/pub?output=csv' // Androids
};

// Planilha ativa atual
let currentSheetId = 0;

// Dados de exemplo para demonstração (serão usados se a planilha não estiver configurada)
const EXAMPLE_PRODUCTS = [
    {
        Nome: "iPhone 15 Pro",
        Imagem: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300",
        Descricao: "Smartphone premium com câmera profissional",
        Preco: "R$ 7.999,00",
        Parcelas: "12x de R$ 666,58",
        RAM: "8GB",
        Armazenamento: "256GB"
    },
    {
        Nome: "Samsung Galaxy S24",
        Imagem: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300",
        Descricao: "Android flagship com IA avançada",
        Preco: "R$ 5.499,00",
        Parcelas: "10x de R$ 549,90",
        RAM: "12GB",
        Armazenamento: "512GB"
    },
    {
        Nome: "Xiaomi Redmi Note 13",
        Imagem: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
        Descricao: "Custo-benefício excepcional",
        Preco: "R$ 1.299,00",
        Parcelas: "6x de R$ 216,50",
        RAM: "6GB",
        Armazenamento: "128GB"
    }
];

// Função para obter produtos de exemplo baseado na planilha selecionada
function getExampleProducts(sheetId) {
    if (sheetId === 1) {
        // Produtos Android de exemplo
        return [
            {
                Nome: "Samsung Galaxy S24",
                Imagem: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300",
                Descricao: "Android flagship com IA avançada",
                Preco: "R$ 5.499,00",
                Parcelas: "10x de R$ 549,90",
                RAM: "12GB",
                Armazenamento: "512GB"
            },
            {
                Nome: "Xiaomi Redmi Note 13",
                Imagem: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300",
                Descricao: "Custo-benefício excepcional",
                Preco: "R$ 1.299,00",
                Parcelas: "6x de R$ 216,50",
                RAM: "6GB",
                Armazenamento: "128GB"
            },
            {
                Nome: "Google Pixel 8",
                Imagem: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300",
                Descricao: "Android puro com melhor câmera",
                Preco: "R$ 3.999,00",
                Parcelas: "8x de R$ 499,88",
                RAM: "8GB",
                Armazenamento: "256GB"
            }
        ];
    } else {
        // Produtos iPhone de exemplo (planilha 0)
        return EXAMPLE_PRODUCTS;
    }
}

// Função para buscar dados do Google Sheets
async function fetchProductsData(sheetId = currentSheetId) {
    try {
        showLoading(true);
        
        let products = [];
        const sheetUrl = SHEET_URLS[sheetId];
        
        // Primeiro tenta a URL configurada, se falhar usa os dados de exemplo
        try {
            if (sheetUrl && !sheetUrl.includes('SEU_ID_DA_PLANILHA')) {
                const response = await fetch(sheetUrl);
                if (!response.ok) throw new Error('Planilha não encontrada');
                const csvText = await response.text();
                products = parseCSV(csvText);
            } else {
                throw new Error('URL da planilha não configurada');
            }
        } catch (error) {
            console.log('Usando dados de exemplo...');
            products = getExampleProducts(sheetId);
        }
        
        if (products.length === 0) {
            throw new Error('Nenhum produto encontrado');
        }
        
        displayProducts(products);
        showLoading(false);
        
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        showError();
        showLoading(false);
    }
}

// Função para converter CSV em array de objetos
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(header => header.trim());
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === headers.length) {
            const product = {};
            headers.forEach((header, index) => {
                product[header] = values[index].trim();
            });
            products.push(product);
        }
    }
    
    return products;
}

// Função para fazer parse de uma linha CSV (lida com vírgulas dentro de aspas)
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

// Função para exibir os produtos na página
function displayProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    
    products.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        grid.appendChild(productCard);
    });
}

// Função para criar um card de produto
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Formatação do preço
    const price = formatPrice(product.Preco || product.preco || '');
    const installments = product.Parcelas || product.parcelas || '';
    
    // Especificações
    const ram = product.RAM || product.ram || '';
    const storage = product.Armazenamento || product.armazenamento || product.storage || '';
    
    card.innerHTML = `
        <div class="product-image-container">
            <img src="${product.Imagem || product.imagem || 'https://via.placeholder.com/300x200?text=Sem+Imagem'}" 
                 alt="${product.Nome || product.nome || 'Produto'}" 
                 class="product-image"
                 onerror="this.src='https://via.placeholder.com/300x200?text=Sem+Imagem'}">
            <div class="specs-overlay">
                ${ram ? `<div class="spec-badge ram"><i class="fas fa-memory"></i> ${ram}</div>` : ''}
                ${storage ? `<div class="spec-badge storage"><i class="fas fa-hdd"></i> ${storage}</div>` : ''}
            </div>
        </div>
        <div class="product-info">
            <h3 class="product-name">${product.Nome || product.nome || 'Produto sem nome'}</h3>
            <p class="product-description">${product.Descricao || product.descricao || 'Descrição não disponível'}</p>
            <div class="product-price">
                <div class="price-main">${price}</div>
                ${installments ? `<div class="price-installments"><i class="fas fa-credit-card"></i> ${installments}</div>` : ''}
            </div>
        </div>
    `;
    
    return card;
}

// Função para formatar preço
function formatPrice(priceString) {
    if (!priceString) return 'Preço não informado';
    
    // Se já está formatado, retorna como está
    if (priceString.includes('R$')) return priceString;
    
    // Tenta converter para número e formatar
    const number = parseFloat(priceString.replace(/[^\d,.-]/g, '').replace(',', '.'));
    if (isNaN(number)) return priceString;
    
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(number);
}

// Função para mostrar/esconder loading
function showLoading(show) {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('products-grid');
    const error = document.getElementById('error-message');
    
    if (show) {
        loading.style.display = 'block';
        grid.style.display = 'none';
        error.style.display = 'none';
    } else {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }
}

// Função para mostrar erro
function showError() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('products-grid');
    const error = document.getElementById('error-message');
    
    loading.style.display = 'none';
    grid.style.display = 'none';
    error.style.display = 'block';
}

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    initializeSheetButtons();
    fetchProductsData();
});

// Função para recarregar dados (pode ser chamada externamente)
function reloadProducts() {
    fetchProductsData();
}

// Exporta funções para uso global
window.reloadProducts = reloadProducts;



// Função para trocar de planilha
function switchSheet(sheetId) {
    currentSheetId = sheetId;
    
    // Atualizar botões ativos
    document.querySelectorAll('.sheet-selection .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-sheet-id="${sheetId}"]`).classList.add('active');
    
    // Carregar dados da nova planilha
    fetchProductsData(sheetId);
}

// Função para inicializar os event listeners dos botões
function initializeSheetButtons() {
    document.querySelectorAll('.sheet-selection .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const sheetId = parseInt(btn.getAttribute('data-sheet-id'));
            switchSheet(sheetId);
        });
    });
}

