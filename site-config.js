/* Site-wide config — update these values when you get your domain, Calendly, or LinkedIn */
window.SITE_CONFIG = {
  name: 'Alessandro Gayttan',
  tagline: 'Production-ready websites, business systems & AI automations',
  email: 'alessandrogayttan@gmail.com',
  whatsapp: '523324453536',
  whatsappMessage: "Hi Alessandro, I'd like to discuss a project.",
  calendly: 'https://calendly.com/alessandrogayttan/15min',
  linkedin: 'https://www.linkedin.com/in/alessandrogayttan',
  github: 'https://github.com/alessandrogayttan',
  domain: 'alessandrogayttan.github.io',
};

window.getWaUrl = function (msg) {
  const c = window.SITE_CONFIG;
  return 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg || c.whatsappMessage);
};
