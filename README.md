# Optimización de Beneficio en Vivero · Programación Lineal en ℝ³

Aplicativo web interactivo de alto rendimiento para el análisis, visualización y resolución del problema de programación lineal de producción de sustratos en un vivero.

🚀 **Acceso en vivo en GitHub Pages:** [https://ng057830.github.io/programacion_lineal/](https://ng057830.github.io/programacion_lineal/)

---

## 📌 Enunciado del Problema

Un vivero produce dos variedades de sustrato agrícola:
- **Sustrato Tipo A ($x$):** aporta un beneficio de **50 €/m³**.
- **Sustrato Tipo B ($y$):** aporta un beneficio de **60 €/m³**.

### Recursos Disponibles y Restricciones Técnicas:
1. **Tierra vegetal disponible:** Máximo $21.000\text{ kg}$.
   $$60x + 50y \le 21\,000 \iff 6x + 5y \le 2100$$
2. **Horas de trabajo disponibles:** Máximo $15.000\text{ horas}$.
   $$30x + 50y \le 15\,000 \iff 3x + 5y \le 1500$$
3. **Condición de mezcla/demanda:**
   $$x \le 5y \iff x - 5y \le 0$$
4. **Condiciones de no negatividad física:**
   $$x \ge 0, \quad y \ge 0$$

---

## 🎯 Solución Óptima

- **Vértice Óptimo:** $B(200, 180)$
- **Producción Sustrato A ($x$):** $200\text{ m³}$
- **Producción Sustrato B ($y$):** $180\text{ m³}$
- **Beneficio Máximo Alcanzado:** **20.800 €**
- **Eficiencia de Recursos:** Agotamiento pleno del 100% de la tierra vegetal ($21.000\text{ kg}$) y del 100% de las horas de trabajo ($15.000\text{ h}$).

---

## 🌟 Características del Aplicativo Rediseñado

1. **Visualizador 3D en $\mathbb{R}^3$ con Plotly:**
   - Representación dual sincronizada: Región factible plana en el suelo ($z = 0$) y Prisma Truncado tridimensional levantado hasta el plano de beneficio $z = 50x + 60y$.
   - Malla de superficie coloreada por gradiente térmico de beneficio.
   - Presets de cámara rápida: vista isométrica, planta (superior 2D) y frontal.
2. **Método Gráfico 2D & Rectas de Nivel:**
   - Canvas interactivo de alta resolución con las rectas frontera coloreadas y semiplanos sombreados.
   - Control deslizante interactivo y botón de **animación de barrido de isobeneficio** ($50x + 60y = k$).
3. **Simulador / Sandbox de Producción:**
   - Sliders y entradas numéricas en tiempo real para experimentar con cualquier combinación $(x, y)$.
   - Medidores de consumo porcentual y detección instantánea de infracción de restricciones.
   - Botones de salto rápido a los 4 vértices del polígono convexo.
4. **Memoria de Cálculo Analítico Paso a Paso:**
   - Formulación matemática rigurosa renderizada con KaTeX.
   - Tabla de cortes con los ejes y resolución de los sistemas lineales $2 \times 2$.
   - Justificación teórica mediante el Teorema Fundamental de la Programación Lineal.

---

Desarrollado con HTML5 semántico, CSS3 moderno con variables y Vanilla JavaScript ES6+.
