<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ficha de tienda</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      background-color: #f7f7f7;
    }
    .card {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 600px;
    }
    h2 { margin-top: 0; }
    a { color: #0070f3; font-weight: bold; }
  </style>
</head>
<body>
  <div id="content">Cargando...</div>

  <script>
    function getQueryParam(name) {
      return new URLSearchParams(window.location.search).get(name);
    }

    async function loadShop() {
      const id = getQueryParam('id');
      if (!id) {
        document.getElementById('content').innerHTML = "<p>Falta el ID.</p>";
        return;
      }

      try {
        const res = await fetch(`/api/shop?id=${encodeURIComponent(id)}`);
        const json = await res.json();

        if (!json.data || json.data.length === 0) {
          document.getElementById('content').innerHTML = "<p>Tienda no encontrada.</p>";
          return;
        }

        const s = json.data[0];

        document.getElementById('content').innerHTML = `
          <div class="card">
            <h2>${s.name}</h2>
            <p><strong>Categoría:</strong> ${s.category || 'Sin categoría'}</p>
            <p><strong>Dirección:</strong> ${s.address || ''}</p>
            <p><strong>Teléfono:</strong> ${s.phone || ''}</p>
            <p><strong>Email:</strong> ${s.email || ''}</p>
            <p><strong>Web:</strong> ${s.website ? `<a href="${s.website}" target="_blank">${s.website}</a>` : ''}</p>
            <p><strong>Descripción:</strong><br>${s.description || ''}</p>
            <p><a href="/">Volver</a></p>
          </div>
        `;
      } catch (err) {
        console.error(err);
        document.getElementById('content').innerHTML = "<p>Error cargando la tienda.</p>";
      }
    }

    loadShop();
  </script>
</body>
</html>
