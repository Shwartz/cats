let addScript = (scripts = []) => scripts.map(script => `<script src="${script}"></script>`).join('\n'),
    addCss = (css = []) => css.map(style => `<link rel="stylesheet" href="${css}">`).join('\n'),
    base = (body, scripts = [], css = []) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Javascrript modifying html pattern</title>
    ${addScript(scripts)}
    ${addCss(css)}
</head>
<body>
<p><a href="/test">Test</a> : <a href="/testa">TestA</a></p>
${body}
</body>`;

export {base, addScript, addCss}

