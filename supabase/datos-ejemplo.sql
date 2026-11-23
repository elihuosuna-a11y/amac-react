update public.perfiles set aprobado = true
where id = (select id from auth.users where email = 'maria.trevino@correo-prueba.mx');

update public.perfiles set rol = 'admin', aprobado = true
where id = (select id from auth.users where email = 'coordinacion@amac-nl.mx');

insert into public.vacantes
  (empresa_id, titulo, sueldo, ubicacion, horario, categoria,
   descripcion, requisitos, prestaciones, telefono_contacto, estado)
select u.id, v.titulo, v.sueldo, v.ubicacion, v.horario, v.categoria,
       v.descripcion, v.requisitos, v.prestaciones, v.telefono, v.estado
from auth.users u
cross join (values
  ('Recepción de almacén', 8600, 'Col. Centro, Monterrey, N.L.', 'Matutino', 'Logística y almacén',
   'Recibir la mercancía que llega al almacén, revisar que esté completa y anotarla en la lista de entradas.',
   E'Saber leer y escribir\nUso básico de computadora o celular\nDisponibilidad por las mañanas',
   E'Prestaciones de ley\nComidas incluidas\nApoyo para transporte',
   '8112345678', 'activa'),
  ('Atención a clientes', 9200, 'Guadalupe, N.L.', 'Vespertino', 'Atención a clientes',
   'Recibir a los clientes en mostrador, resolver dudas sencillas y canalizar los pedidos al área de ventas.',
   E'Trato amable con las personas\nSaber leer y escribir',
   E'Prestaciones de ley\nVales de despensa',
   null, 'activa'),
  ('Ayudante de cocina', 7500, 'Apodaca, N.L.', 'Medio tiempo', 'Alimentos',
   'Apoyar en la preparación de alimentos, lavar y picar verduras y mantener limpia el área de cocina.',
   E'Gusto por la cocina\nPoder estar de pie por periodos cortos',
   E'Comida incluida\nPago semanal',
   '8187654321', 'activa'),
  ('Empacador(a) de supermercado', 6900, 'San Nicolás, N.L.', 'Fines de semana', 'Comercio',
   'Empacar las compras de los clientes en las cajas y ayudarles a llevarlas a su auto si lo necesitan.',
   E'Disponibilidad sábados y domingos\nBuena actitud de servicio',
   E'Propinas\nApoyo para transporte',
   null, 'activa'),
  ('Cajero(a) de farmacia', 8200, 'San Pedro Garza García, N.L.', 'Matutino', 'Comercio',
   'Cobrar en caja, entregar tickets y apoyar en el acomodo de productos de mostrador.',
   E'Manejo básico de dinero\nUso de computadora o terminal de cobro',
   E'Prestaciones de ley\nDescuento en medicamentos',
   '8122223333', 'activa'),
  ('Asistente de biblioteca', 6500, 'Monterrey, N.L.', 'Vespertino', 'Educación y cultura',
   'Ordenar libros en los estantes, registrar préstamos y orientar a los visitantes.',
   E'Gusto por la lectura\nOrden y paciencia',
   E'Horario flexible\nCursos gratuitos del centro cultural',
   null, 'activa'),
  ('Auxiliar de inventario', 7800, 'Santa Catarina, N.L.', 'Matutino', 'Logística y almacén',
   'Contar mercancía y actualizar el inventario semanal.',
   E'Saber sumar y restar\nUso básico de celular',
   E'Prestaciones de ley',
   null, 'pausada')
) as v(titulo, sueldo, ubicacion, horario, categoria, descripcion, requisitos, prestaciones, telefono, estado)
where u.email = 'rh@serviciosdelnorte.mx';
