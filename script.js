// Função para alternar entre os temas
function toggleDarkTheme() {
    var element = document.body;
    var isDarkTheme = element.classList.contains("dark-theme");

    // Salvando o estado do tema no localStorage
    localStorage.setItem("darkTheme", !isDarkTheme);

    // Aplicando o tema imediatamente
    if (isDarkTheme) {
        element.classList.remove("dark-theme");
    } else {
        element.classList.add("dark-theme");
    }
}

// Verificando o estado do tema ao carregar a página
window.addEventListener("DOMContentLoaded", function() {
    var isDarkTheme = localStorage.getItem("darkTheme");

    // Se o tema estiver escuro, aplicar o dark-theme imediatamente
    if (isDarkTheme === "true") {
        document.body.classList.add("dark-theme");
    }
});
