# Entorno y seguridad — Instrucciones

1. Propósito
- Mantener las claves y secretos fuera del repositorio. Usa `.env` para variables locales y `.env.example` para documentar las variables requeridas.

2. Uso (local)
- Copia `.env.example` a `.env` y rellena los valores.
  - Windows (PowerShell):

```powershell
cp .env.example .env
```

3. Buenas prácticas
- Nunca subas `.env` al repositorio. Ya se añadió `.env` a `.gitignore`.
- Para CI/CD (GitHub Actions) usa GitHub Secrets (Repository → Settings → Secrets).
- Prefijos: si usas Vite, las variables que necesites exponer al frontend deben empezar con `VITE_`.
- No pongas claves privadas (por ejemplo, `STRIPE_SECRET_KEY`, `JWT_SECRET`) en el frontend; guárdalas en el backend o en secretos de CI.

4. Comprobación y escaneo
- Ejecuta un escaneo de secretos antes de publicar (ejemplos: `git-secrets`, `detect-secrets`, `trufflehog`).

5. Qué hacer si se filtra una clave
- Revocar la clave inmediatamente y generar una nueva.
- Revisar el historial del repositorio y rotar las credenciales comprometidas.

6. Recursos rápidos
- GitHub Secrets: https://github.com/<your-org>/<your-repo>/settings/secrets
- detect-secrets: https://github.com/Yelp/detect-secrets
