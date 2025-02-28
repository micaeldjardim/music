export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

module.exports = [
  'strapi::errors',
  'strapi::security',
  'strapi::query',
  'strapi::body',
  'strapi::public',
  'strapi::favicon',
  // Aqui você pode adicionar outros middlewares, como o de CORS:
  {
    name: 'strapi::cors',
    config: {
      origin: ['http://127.0.0.1:5500', 'https://fillthesong.com'],
    },
  },
];

