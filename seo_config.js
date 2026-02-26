window.injectSEO = function injectSEO() {
    const metaTags = [
        { name: "keywords", content: "Clínica para autismo em São Luís, Terapia ABA São Luís, Clínica especializada em autismo MA, Fono infantil autismo São Luís, Terapia Ocupacional Infantil São Luís, Integração Sensorial São Luís" },
        { property: "og:title", content: "Clínica Semear - Especialistas em Autismo em São Luís, MA" },
        { property: "og:description", content: "Atendimento multidisciplinar humanizado para crianças com TEA. ABA, Fono, TO, Integração Sensorial e mais. Agende sua avaliação." },
        { property: "og:image", content: "https://images.unsplash.com/photo-1544955404-b9b6e6be672e?q=80&w=2062&auto=format&fit=crop" },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "pt_BR" },
        { name: "geo.region", content: "BR-MA" },
        { name: "geo.placename", content: "São Luís" }
    ];

    const head = document.querySelector('head');

    metaTags.forEach(tag => {
        // Avoid duplicating tags if they already exist in the document
        const selector = tag.name
            ? `meta[name="${tag.name}"]`
            : `meta[property="${tag.property}"]`;

        if (head.querySelector(selector)) return;

        const element = document.createElement('meta');
        Object.keys(tag).forEach(key => element.setAttribute(key, tag[key]));
        head.appendChild(element);
    });
}
