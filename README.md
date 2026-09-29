# LaSiCoP — demo integrado v3

Cambios:
- En la portada, el título y la descripción de “Simulaciones” comparten el mismo bloque a la izquierda y las flechas quedan a la derecha, como en la galería.
- La descripción solo baja las flechas cuando el ancho realmente ya no alcanza.
- En `entry.html`, el footer permanece siempre visible en la parte inferior.
- El contenido principal y el índice lateral tienen scroll independiente dentro del espacio disponible.
- En móvil, el índice lateral también queda limitado entre el header y el footer.
- Se mantienen una sola entrada por simulación, autores + última actualización y contenido MDX.

## Interactive MDX demo
The `tanque-nivel/introduccion.mdx` entry now includes an example interactive valve characteristic and dynamic tank response. The presentation lives in the MDX file, styles are appended to `entry.css`, and behavior is implemented in `interactive-demo.js`. This is a demonstration of the entry format rather than the final validated teaching model.
