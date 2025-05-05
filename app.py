from flask import Flask, render_template, request, jsonify
from sympy import sympify, Symbol, simplify
from sympy.parsing.sympy_parser import parse_expr

app = Flask(__name__)

def evaluate_term(expr, k):
    """Evalúa un término de la sucesión para un valor de k."""
    try:
        term = expr.subs(Symbol('k'), k)  # Sustituye el valor de k en la expresión simbólica
        term_simplified = simplify(term)  # Simplifica el término resultante
        return float(term_simplified)     # Convierte el resultado a un número decimal
    except Exception as e:
        raise Exception(f"Error al evaluar el término k={k}: {str(e)}")

def calculate_terms_recursively(expr, current_k, n, terms):
    """
    Función recursiva que calcula los términos de la sucesión desde current_k hasta n.
    
    Args:
        expr: Expresión simbólica (usando SymPy) que define la sucesión (ej. 1/k).
        current_k: Valor actual de k para evaluar el término.
        n: Límite superior de la sucesión.
        terms: Lista que acumula los pares (k, valor) de cada término calculado.
    
    Returns:
        La lista terms con todos los términos calculados recursivamente.
    """
    # Caso base: si current_k supera el límite superior n, termina la recursión
    # y retorna la lista de términos acumulados
    if current_k > n:
        return terms
    
    try:
        # Evalúa el término para el valor actual de k usando la función evaluate_term
        term_value = evaluate_term(expr, current_k)
        # Añade el par (current_k, term_value) a la lista de términos
        terms.append((current_k, term_value))
        # Llamada recursiva: se invoca a sí misma con el siguiente valor de k (current_k + 1)
        return calculate_terms_recursively(expr, current_k + 1, n, terms)
    except Exception as e:
        # Si hay un error al evaluar un término, lo propaga con un mensaje específico
        raise Exception(f"Error al evaluar el término k={current_k}: {str(e)}")

def evaluate_sequence(formula, m, n):
    """Evalúa una sucesión desde m hasta n, calcula suma y multiplicación usando recursividad."""
    try:
        # Convierte los límites a enteros y valida que sean positivos y m <= n
        m, n = int(m), int(n)
        if m < 1 or n < 1:
            return None, "Error: Los límites deben ser enteros positivos (m y n deben ser mayores o iguales a 1)", None, None
        if m > n:
            return None, f"Error: El límite inferior ({m}) debe ser menor o igual al límite superior ({n})", None, None
        
        # Valida que la fórmula no esté vacía
        if not formula.strip():
            return None, "Error: La fórmula no puede estar vacía", None, None
        
        # Convierte la fórmula a una expresión de SymPy, reemplazando ^ por **
        k = Symbol('k')
        formula = formula.replace('^', '**')
        try:
            expr = parse_expr(formula, local_dict={'k': k})
        except Exception as e:
            return None, f"Error: La fórmula tiene un error de sintaxis. Asegúrate de usar operadores válidos y que la expresión sea correcta (por ejemplo, '1/k', 'k^2', '2*k + 1')", None, None
        
        # Inicializa la lista de términos y la calcula recursivamente desde m hasta n
        terms = []
        terms = calculate_terms_recursively(expr, m, n, terms)
        
        # Calcula la suma de los valores de los términos
        term_values = [term[1] for term in terms]
        suma = sum(term_values)
        
        # Calcula la multiplicación de los valores de los términos
        multiplicacion = 1
        for value in term_values:
            multiplicacion *= value
        
        return terms, None, suma, multiplicacion
    except ValueError as ve:
        return None, f"Error: Los límites ({m}, {n}) deben ser números enteros válidos", None, None
    except Exception as e:
        return None, f"Error inesperado: {str(e)}", None, None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.get_json()
    formula = data.get('formula', '')
    lower_limit = data.get('lower_limit', '')
    upper_limit = data.get('upper_limit', '')

    print(f"Fórmula recibida: '{formula}'")
    print(f"Límite inferior recibido: '{lower_limit}'")
    print(f"Límite superior recibido: '{upper_limit}'")
    
    terms, error, suma, multiplicacion = evaluate_sequence(formula, lower_limit, upper_limit)
    if error:
        return jsonify({'result': 'Error', 'error': error, 'terms': [], 'suma': None, 'multiplicacion': None})

    # Formatear el resultado como una lista de términos
    result_str = f"Sucesión para a_k = {formula}, k desde {lower_limit} hasta {upper_limit}:\n"
    result_str += "\n".join([f"Término k={k}: {value:.4f}" for k, value in terms])
    result_str += f"\n\nSuma = {suma:.4f}"
    result_str += f"\nMultiplicación = {multiplicacion:.4e}"  # Formato científico para la multiplicación
    
    return jsonify({
        'result': result_str,
        'terms': terms,
        'suma': suma,
        'multiplicacion': multiplicacion
    })

if __name__ == '__main__':
    app.run(debug=True)