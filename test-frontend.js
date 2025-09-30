// Script para testar frontend do P.I.T.E.R
// Simula seleção de filtros e clique no botão buscar

console.log('🚀 Testando P.I.T.E.R Frontend...');

// Aguardar o DOM carregar
setTimeout(() => {
  // Selecionar Goiânia
  const municipioSelect = document.getElementById('municipio');
  if (municipioSelect) {
    municipioSelect.value = 'goiania';
    municipioSelect.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Município selecionado: Goiânia');
  } else {
    console.log('❌ Select de município não encontrado');
  }

  // Selecionar Robótica
  const categoriaSelect = document.getElementById('categoria');
  if (categoriaSelect) {
    categoriaSelect.value = 'robotica';
    categoriaSelect.dispatchEvent(new Event('change', { bubbles: true }));
    console.log('✅ Categoria selecionada: Robótica');
  } else {
    console.log('❌ Select de categoria não encontrado');
  }

  // Aguardar um pouco para o estado atualizar
  setTimeout(() => {
    // Clicar no botão buscar
    const botaoBuscar = document.querySelector('button[type="button"]');
    if (botaoBuscar) {
      console.log('🔍 Clicando no botão buscar...');
      botaoBuscar.click();
    } else {
      console.log('❌ Botão buscar não encontrado');
    }
  }, 500);
}, 1000);