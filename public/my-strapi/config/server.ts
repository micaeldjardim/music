module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  url: env('PUBLIC_URL', 'https://strapi-service-597494138856.us-central1.run.app'), 
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET'),
    },
  },
});
