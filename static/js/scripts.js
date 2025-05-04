function calculate() {
    const lower_limit = document.getElementById('lower_limit').value;
    const upper_limit = document.getElementById('upper_limit').value;
    const formula = document.getElementById('formula').value;

    // Validar que los campos no estén vacíos
    if (!lower_limit || !upper_limit || !formula) {
        showError('Todos los campos son obligatorios');
        return;
    }

    // Validar que los límites sean números enteros positivos
    const m = parseInt(lower_limit);
    const n = parseInt(upper_limit);
    if (isNaN(m) || isNaN(n) || m < 1 || n < 1) {
        showError('Los límites deben ser enteros positivos');
        return;
    }
    if (m > n) {
        showError(`El límite inferior (${m}) debe ser menor o igual al límite superior (${n})`);
        return;
    }

    // Validar que la fórmula no esté vacía (ya se valida en el backend)
    if (!formula.trim()) {
        showError('La fórmula no puede estar vacía');
        return;
    }

    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formula, lower_limit, upper_limit }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud al servidor');
        }
        return response.json();
    })
    .then(data => {
        const resultContainer = document.getElementById('result-container');
        const resultList = document.getElementById('result-list');
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        const sumaText = document.getElementById('suma-text');
        const multiplicacionText = document.getElementById('multiplicacion-text');
        const resultNote = document.getElementById('result-note');

        resultList.innerHTML = '';
        errorContainer.style.display = 'none';
        sumaText.innerText = '';
        multiplicacionText.innerText = '';
        resultNote.innerText = '';

        if (data.error) {
            showError(data.error);
        } else {
            data.terms.forEach(term => {
                const li = document.createElement('li');
                li.innerText = `Término k=${term[0]}: ${term[1].toFixed(4)}`;
                resultList.appendChild(li);
            });
            sumaText.innerText = `Suma = ${data.suma.toFixed(4)}`;
            multiplicacionText.innerText = `Multiplicación = ${data.multiplicacion.toExponential(4)}`;
        }
        resultContainer.classList.add('highlight');
        setTimeout(() => resultContainer.classList.remove('highlight'), 1000);
    })
    .catch(error => {
        console.error('Error:', error);
        showError('Error al calcular: ' + error.message);
    });
}

function loadExample() {
    const examples = [
        { formula: '1/k', lower_limit: '10', upper_limit: '30' },
        { formula: 'k^2', lower_limit: '1', upper_limit: '5' },
        { formula: '2*k + 1', lower_limit: '3', upper_limit: '7' },
        { formula: 'k/2', lower_limit: '4', upper_limit: '10' },
        { formula: '3*k', lower_limit: '1', upper_limit: '6' }
    ];

    const randomExample = examples[Math.floor(Math.random() * examples.length)];

    document.getElementById('lower_limit').value = randomExample.lower_limit;
    document.getElementById('upper_limit').value = randomExample.upper_limit;
    document.getElementById('formula').value = randomExample.formula;

    calculate();
}

function exportResult() {
    const resultList = document.getElementById('result-list').innerText;
    const sumaText = document.getElementById('suma-text').innerText;
    const multiplicacionText = document.getElementById('multiplicacion-text').innerText;
    const fullText = `${resultList}\n${sumaText}\n${multiplicacionText}`;
    navigator.clipboard.writeText(fullText)
        .then(() => alert('Resultado copiado al portapapeles: ' + fullText))
        .catch(err => console.error('Error al copiar: ', err));
}

function resetForm() {
    document.getElementById('lower_limit').value = '';
    document.getElementById('upper_limit').value = '';
    document.getElementById('formula').value = '';
    document.getElementById('result-list').innerHTML = '<li>Ingresa una fórmula y límites para calcular la sucesión</li>';
    document.getElementById('suma-text').innerText = '';
    document.getElementById('multiplicacion-text').innerText = '';
    document.getElementById('result-note').innerText = '';
    document.getElementById('error-container').style.display = 'none';
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const resultList = document.getElementById('result-list');
    const sumaText = document.getElementById('suma-text');
    const multiplicacionText = document.getElementById('multiplicacion-text');
    const resultNote = document.getElementById('result-note');

    resultList.innerHTML = '';
    sumaText.innerText = '';
    multiplicacionText.innerText = '';
    resultNote.innerText = '';
    errorMessage.innerText = message;
    errorContainer.style.display = 'block';
}

window.onload = () => {
    document.getElementById('result-list').innerHTML = '<li>Ingresa una fórmula y límites para calcular la sucesión</li>';
};