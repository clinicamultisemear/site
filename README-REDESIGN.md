# Redesign Clínica Semear — setembro de 2026

Aplicado a partir de `PROMPT-CODEX.txt` do pacote fornecido, exclusivamente na branch `redesign-semear-2026`.

## Alterações

- Identidade branca, rosa e azul; conteúdo estático, sem Tailwind, GSAP, Lucide ou carregamento de `data.js` e `seo_config.js`.
- Hero, convênios Unimed/GEAP/Luminar, etapas de atendimento, 12 cartões de terapias, equipe por especialidade, estrutura, FAQ nativo e contato reorganizados conforme o pacote.
- Depoimentos demonstrativos removidos da página. Os arquivos legados ficam preservados, mas não são carregados.
- Canonical, metadados sociais, MedicalClinic/LocalBusiness, robots, sitemap e manifest. Horário exato retirado do schema por divergência entre o site antigo e o pacote; o texto pede confirmação com a equipe.
- Política de privacidade e consentimento negado por padrão, com restauração antes da configuração do Google Ads e opção de alterar preferências em ambas as páginas.
- Consent Mode avançado, conforme o pacote: cookies não essenciais dependem da escolha; sinais sem cookies podem ocorrer com consentimento negado. Esse comportamento está descrito na política. Referência técnica: https://developers.google.com/tag-platform/security/guides/consent
- Google Ads `AW-18007017680` e conversão `AW-18007017680/99G-CIWyqIscENCRtYpD` preservados; callback e timeout evitam bloquear o WhatsApp. Cliques modificados mantêm o comportamento do navegador.
- Telefone, e-mail e Instagram preservados; todos os CTAs de WhatsApp apontam para `5598999918289` com mensagens contextualizadas.
- Logo com proporções corretas; imagens responsivas WebP e logo reduzida em `assets/`. Todos os 13 originais permanecem byte a byte intactos. Os arquivos `.jpg` originais contêm dados PNG.
- Menu acessível até 1080 px, Escape com retorno de foco, navegação sem JavaScript, foco visível, contraste corrigido e respeito à preferência de movimento reduzido.

## Validação local — 15/09/2026

- `node --check main.js` e `git diff --check`: aprovados.
- `html-validate` 8: ambas as páginas sem erros.
- Playwright + Chrome + axe-core: ambas as páginas em 320, 375, 600, 768, 820, 1024, 1080, 1280 e 1440 px; sem overflow horizontal, imagens quebradas ou violações axe.
- Testados: menu, Escape, âncoras, FAQ, aceitar/recusar/reabrir cookies, persistência, revogação na política, valor inválido, armazenamento indisponível, navegação sem JavaScript e callback/timeout da conversão.
- Recursos locais, JSON do manifest, XML do sitemap e integridade de todas as imagens originais verificados.
- Lighthouse 11 no servidor local, Google bloqueado para não gerar medição de teste:

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP |
| --- | --- | --- | --- | --- | --- |
| Mobile | 99 | 100 | 100 | 100 | 2,1 s |
| Desktop | 98 | 100 | 100 | 100 | 0,5 s |

A transferência medida caiu de 3.150 KiB para 121 KiB no perfil mobile. Resultados de laboratório variam; não equivalem a métricas reais de produção e excluem o custo da tag bloqueada.

## Reproduzir

Instale as ferramentas em uma pasta temporária, sem dependências de produção:

```sh
npm install --prefix /tmp/semear-audit playwright axe-core html-validate@8 lighthouse@11
python3 -m http.server 8765 --bind 127.0.0.1
# Em outro terminal:
NODE_PATH=/tmp/semear-audit/node_modules node scripts/check-site.cjs
/tmp/semear-audit/node_modules/.bin/html-validate index.html politica-de-privacidade.html
```

`CHROME_PATH` permite escolher o executável do Chrome; `SITE_URL` permite escolher o servidor de teste. O script bloqueia requisições de publicidade para não registrar conversões reais.

## Conferência antes do merge

- Conferir o preview da hospedagem e o comportamento dos links externos em dispositivo real.
- Confirmar com a clínica nomes, disponibilidade da equipe, convênios, público atendido, recursos complementares e horário operacional. Esses dados seguem o pacote fornecido; a auditoria de código não confirma a operação clínica.
- Validar a política de privacidade com o responsável pelo tratamento dos dados.
- Validar atribuição/conversão na conta Google Ads com Tag Assistant; o teste local confirma configuração e comportamento, não recebimento pela conta.
- Conferir cache/compressão e métricas na hospedagem real.

O Pull Request deve permanecer sem merge automático.
