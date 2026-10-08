# Agua Neon

Agua Neon es una base de dashboard financiero modular con estética cyber-industrial y enfoque en gestión de activos, rendimiento y monitoreo de operaciones.

## Stack inicial
- Node.js + Express
- HTML + CSS + JavaScript
- API REST simple para mock data

## Requisitos
- Node.js 18+

## Instalación
```bash
npm install
```

## Ejecutar
```bash
npm start
```

La app estará disponible en:
```bash
http://localhost:3000
```

## Estructura
```bash
.
├── README.md
├── package.json
├── server.js
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── .gitignore
└── .env.example
```

## Estado actual
Este es el punto de partida del MVP. Hay una base funcional de UI + API con datos mock para:
- balance general
- cartera de activos
- rendimiento
- transacciones recientes
- monitor de mercado

## Siguiente fase sugerida
1. conectar base de datos
2. autenticación
3. panel de wallet/token
4. historial de movimientos
5. onboarding y pagos
6. despliegue
