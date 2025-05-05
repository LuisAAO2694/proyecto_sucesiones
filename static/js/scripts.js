function calculate() {
    const lower_limit = document.getElementById('lower_limit');
    const upper_limit = document.getElementById('upper_limit');
    const formula = document.getElementById('formula');
    const resultContainer = document.getElementById('result-container');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    // Resetear animaciones y estilos
    [lower_limit, upper_limit, formula].forEach(input => input.classList.remove('valid', 'invalid'));
    errorContainer.style.display = 'none';
    resultContainer.classList.remove('highlight');

    // Validar que los campos no estén vacíos
    if (!lower_limit.value || !upper_limit.value || !formula.value) {
        showFieldError([lower_limit, upper_limit, formula], 'Todos los campos son obligatorios');
        return;
    }

    // Validar que los límites sean números enteros positivos
    const m = parseInt(lower_limit.value);
    const n = parseInt(upper_limit.value);
    if (isNaN(m) || isNaN(n) || m < 1 || n < 1) {
        showFieldError([lower_limit, upper_limit], 'Los límites deben ser enteros positivos');
        return;
    }
    if (m > n) {
        showFieldError([lower_limit, upper_limit], `El límite inferior (${m}) debe ser menor o igual al límite superior (${n})`);
        return;
    }

    // Normalizar la fórmula: Convertir 'K' a 'k'
    let normalizedFormula = formula.value.replace(/K/g, 'k');

    // Enviar solicitud al backend con la fórmula normalizada
    fetch('/calculate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formula: normalizedFormula, lower_limit: m, upper_limit: n }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error en la solicitud al servidor');
        }
        return response.json();
    })
    .then(data => {
        const resultList = document.getElementById('result-list');
        const sumaText = document.getElementById('suma-text');
        const multiplicacionText = document.getElementById('multiplicacion-text');
        const resultNote = document.getElementById('result-note');

        resultList.innerHTML = '';
        sumaText.innerText = '';
        multiplicacionText.innerText = '';
        resultNote.innerText = '';

        if (data.error) {
            showError(data.error);
        } else {
            [lower_limit, upper_limit, formula].forEach(input => input.classList.add('valid', 'animate__animated', 'animate__pulse'));
            data.terms.forEach(term => {
                const li = document.createElement('li');
                li.innerText = `Término k=${term[0]}: ${term[1].toFixed(4)}`;
                resultList.appendChild(li);
            });
            sumaText.innerText = `Suma = ${data.suma.toFixed(4)}`;
            multiplicacionText.innerText = `Multiplicación = ${data.multiplicacion.toExponential(4)}`;
            resultContainer.classList.add('highlight', 'animate__animated', 'animate__bounceIn');
            setTimeout(() => resultContainer.classList.remove('animate__bounceIn'), 1000);
        }
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
    const lower_limit = document.getElementById('lower_limit');
    const upper_limit = document.getElementById('upper_limit');
    const formula = document.getElementById('formula');

    lower_limit.value = randomExample.lower_limit;
    upper_limit.value = randomExample.upper_limit;
    formula.value = randomExample.formula;

    [lower_limit, upper_limit, formula].forEach(input => input.classList.add('valid', 'animate__animated', 'animate__tada'));
    setTimeout(() => [lower_limit, upper_limit, formula].forEach(input => input.classList.remove('animate__tada')), 1000);

    calculate();
}

function exportResult() {
    const resultList = document.getElementById('result-list').innerText;
    const sumaText = document.getElementById('suma-text').innerText;
    const multiplicacionText = document.getElementById('multiplicacion-text').innerText;
    const fullText = `${resultList}\n${sumaText}\n${multiplicacionText}`;
    navigator.clipboard.writeText(fullText)
        .then(() => {
            const exportButton = document.querySelector('.btn.secondary:last-child');
            exportButton.classList.add('animate__animated', 'animate__heartBeat');
            setTimeout(() => exportButton.classList.remove('animate__heartBeat'), 1000);
            alert('Resultado copiado al portapapeles: ' + fullText);
        })
        .catch(err => console.error('Error al copiar: ', err));
}

function resetForm() {
    const lower_limit = document.getElementById('lower_limit');
    const upper_limit = document.getElementById('upper_limit');
    const formula = document.getElementById('formula');
    const resultContainer = document.getElementById('result-container');
    const errorContainer = document.getElementById('error-container');

    lower_limit.value = '';
    upper_limit.value = '';
    formula.value = '';
    document.getElementById('result-list').innerHTML = '<li class="placeholder">Ingresa una fórmula y límites para calcular la sucesión</li>';
    document.getElementById('suma-text').innerText = '';
    document.getElementById('multiplicacion-text').innerText = '';
    document.getElementById('result-note').innerText = '';
    errorContainer.style.display = 'none';
    [lower_limit, upper_limit, formula].forEach(input => input.classList.remove('valid', 'invalid'));
    resultContainer.classList.add('animate__animated', 'animate__fadeOut');
    setTimeout(() => {
        resultContainer.classList.remove('animate__fadeOut');
        resultContainer.classList.add('animate__fadeIn');
        setTimeout(() => resultContainer.classList.remove('animate__fadeIn'), 1000);
    }, 500);
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
    errorContainer.classList.add('animate__animated', 'animate__shakeX');
    setTimeout(() => errorContainer.classList.remove('animate__shakeX'), 1000);
}

function showFieldError(inputs, message) {
    inputs.forEach(input => {
        input.classList.add('invalid', 'animate__animated', 'animate__shakeX');
        setTimeout(() => input.classList.remove('animate__shakeX'), 1000);
    });
    showError(message);
}

function validateField(input) {
    const lower_limit = document.getElementById('lower_limit');
    const upper_limit = document.getElementById('upper_limit');
    const formula = document.getElementById('formula');

    if (input === lower_limit || input === upper_limit) {
        const value = parseInt(input.value);
        if (isNaN(value) || value < 1) {
            input.classList.remove('valid');
            input.classList.add('invalid', 'animate__animated', 'animate__wobble');
            setTimeout(() => input.classList.remove('animate__wobble'), 1000);
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid', 'animate__animated', 'animate__pulse');
            setTimeout(() => input.classList.remove('animate__pulse'), 1000);
        }
    } else if (input === formula) {
        if (!input.value.trim()) {
            input.classList.remove('valid');
            input.classList.add('invalid', 'animate__animated', 'animate__wobble');
            setTimeout(() => input.classList.remove('animate__wobble'), 1000);
        } else {
            input.classList.remove('invalid');
            input.classList.add('valid', 'animate__animated', 'animate__pulse');
            setTimeout(() => input.classList.remove('animate__pulse'), 1000);
        }
    }

    // Validar relación entre límites
    if (lower_limit.value && upper_limit.value) {
        const m = parseInt(lower_limit.value);
        const n = parseInt(upper_limit.value);
        if (m > n) {
            [lower_limit, upper_limit].forEach(input => {
                input.classList.remove('valid');
                input.classList.add('invalid', 'animate__animated', 'animate__wobble');
                setTimeout(() => input.classList.remove('animate__wobble'), 1000);
            });
        }
    }
}

window.onload = () => {
    document.getElementById('result-list').innerHTML = '<li class="placeholder">Ingresa una fórmula y límites para calcular la sucesión</li>';
    const inputs = [document.getElementById('lower_limit'), document.getElementById('upper_limit'), document.getElementById('formula')];
    inputs.forEach(input => {
        input.addEventListener('input', () => validateField(input));
    });
};