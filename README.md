# ⭐ Star Recs: Movie Recommendation Engine

<p align="center">
  <img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/ML-PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch">
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
</p>

**Star Recs** es una aplicación full-stack que transforma la búsqueda de películas en una experiencia interactiva. Utilizando una dinámica de **swipe** (estilo Tinder), el sistema recolecta feedback del usuario en tiempo real para alimentar un modelo de **Neural Collaborative Filtering (NCF)** y entregar recomendaciones altamente personalizadas.

---

## 🚀 Características Principales

* **Experiencia Swipe:** Interfaz dinámica para calificar películas (Derecha: Me gusta, Izquierda: No me gusta, Arriba: No la he visto).
* **Motor de Recomendación ML:** Basado en NCF y entrenado con el dataset de MovieLens (330k usuarios).
* **Estrategia Anti-Cold Start:** El algoritmo inyecta un 10% de películas populares en la fase inicial para asegurar que el usuario siempre tenga contenido conocido que calificar.
* **Integración con TMDB:** Obtención de posters y metadata de películas en tiempo real.
* **Trending Global:** Sección de películas populares basada en las calificaciones de todos los usuarios.

---

## 🛠️ Stack Técnico

### Machine Learning
* **Modelo:** Neural Collaborative Filtering (NCF).
* **Dataset:** MovieLens (Histórico 1995-2023).
* **Optimización:** Hiperparámetros ajustados con **Optuna** (MSE actual: 0.8063).

### Backend
* **Framework:** FastAPI.
* **Base de Datos:** PostgreSQL (Catálogo de +86k películas).
* **Lógica Core:** Recibe 10 calificaciones → Inferencia del modelo → Devuelve 5 recomendaciones.

### Frontend
* **Framework:** Next.js / React (Vibe Coding).
* **UI/UX:** Interfaz limpia enfocada en la usabilidad y feedback rápido.

---

## 📈 Hoja de Ruta (Backlog)

### ML & Datos
- [ ] Aplicar normalización de datos (v2).
- [ ] Migrar el enfoque de predicción de "estrellas" a **clasificación binaria** (Like/Dislike).
- [ ] Implementar técnicas de *Data Augmentation*.
- [ ] Pipeline de entrenamiento continuo con la data recolectada de usuarios reales.

### Backend
- [ ] Despliegue en infraestructura con **GPU** para optimizar tiempos de inferencia.
- [ ] Implementación de Auth (JWT) y manejo de roles.

### Frontend
- [ ] Implementar precarga de *Trending* para eliminar tiempos de espera en la carga del modelo.
- [ ] Fallback de imágenes para posters faltantes en la API de TMDB.
- [ ] Buscador manual para que el usuario incluya películas específicas a su perfil.

---

## ⚙️ Instalación y Uso

*(Asegúrate de tener Python 3.9+ y Node.js instalados)*

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/PatricioBet/backend_movie_recommendation
    git clone https://github.com/PatricioBet/frontend_movie_recommendation
    ```

2.  **Configurar el Backend y Frontend:**
    Instala las dependencias y configura tu archivo `.env` con las credenciales de PostgreSQL (revisar `.env.example`).

3. **Ejecutar script para inicio de la Base de datos**
    ```bash
    cd backend_movie_recommendation
    python seed_movies.py
    ```

---

## 👤 Autor

**Patricio Bolívar (Pato)**
* Portfolio: [patriciobet.dev](https://patriciobet.dev)
* GitHub: [@PatricioBet](https://github.com/PatricioBet)

---
