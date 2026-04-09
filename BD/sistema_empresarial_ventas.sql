CREATE DATABASE sistema_empresarial_ventas;
USE sistema_empresarial_ventas;
-- Lineas en donde empieza cada cosa:
-- 235 Consultas || 275 Vistas || 334 Funciones || 380 Procedimientos || 386 Trigger || 422 Transaccion 
-- || 427 Usuarios y Roles || 431 Indices

CREATE TABLE clientes (
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) not null,
    apellido_p VARCHAR(50) not null,
    apellido_m VARCHAR(50) not null,
    telefono VARCHAR(15) not null,
    email VARCHAR(100) UNIQUE not null,
    calle VARCHAR(100) not null,
    cp VARCHAR(10) not null,
    tipo_cliente VARCHAR(20) not null,
    fecha_registro DATE not null
);

CREATE TABLE sucursales (
    id_sucursal INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) not null,
    ciudad VARCHAR(50) not null,
    direccion VARCHAR(100) not null,
    telefono VARCHAR(15) not null
);

CREATE TABLE empleados (
    id_empleado INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) not null,
    apellido_p VARCHAR(50) not null,
    apellido_m VARCHAR(50) not null,
    salario DECIMAL(10,2) not null,
    fecha_contratacion DATE not null,
    sucursal_id INT not null,
    FOREIGN KEY (sucursal_id) 
        REFERENCES sucursales(id_sucursal)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE productos (
    id_producto INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) not null,
    descripcion VARCHAR(100) not null,
    precio DECIMAL(10,2) not null,
    CHECK (precio > 0),
    stock INT not null,
    CHECK (stock >= 0),
    stock_minimo INT not null
);

CREATE TABLE ventas (
    id_venta INT PRIMARY KEY AUTO_INCREMENT,
    fecha DATE DEFAULT (CURRENT_DATE) not null,
    total DECIMAL(10,2) not null,
    cliente_id INT not null,
    empleado_id INT not null,
    sucursal_id INT not null,
    FOREIGN KEY (cliente_id) 
        REFERENCES clientes(id_cliente)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (empleado_id) 
        REFERENCES empleados(id_empleado)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (sucursal_id) 
        REFERENCES sucursales(id_sucursal)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

CREATE TABLE detalle_ventas (
    id_detalle INT PRIMARY KEY AUTO_INCREMENT,
    venta_id INT not null,
    producto_id INT not null,
    cantidad INT not null,
    CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) not null,
    subtotal DECIMAL(10,2) not null,
    FOREIGN KEY (venta_id) 
        REFERENCES ventas(id_venta)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (producto_id) 
        REFERENCES productos(id_producto)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- 														INSERTS
INSERT INTO sucursales (nombre, ciudad, direccion, telefono) VALUES -- Se empieza por la tablas sin FK para evitar 
('Sucursal Centro','Queretaro','Av. Centro 123','4421111111'), --      incomvenietes con las FK de otras tablas
('Sucursal Norte','Queretaro','Av. Norte 456','4421111112'),
('Sucursal Sur','Queretaro','Av. Sur 789','4421111113'),
('Sucursal Este','Queretaro','Av. Este 321','4421111114'),
('Sucursal Oeste','Queretaro','Av. Oeste 654','4421111115'),
('Sucursal Plaza','Queretaro','Plaza Victoria','4421111116'),
('Sucursal de la Costa','Queretaro','Costa 1','4421111117'),
('Sucursal Industrial','Queretaro','Zona Industrial','4421111118'),
('Sucursal Aeropuerto','Queretaro','Carretera Aeropuerto','4421111119'),
('Sucursal UPQ','Queretaro','El rosario','4421111120'),
('Sucursal Centro 2','Queretaro','Av. Centro 321','4421111121'),
('Sucursal Norte 2','Queretaro','Av. Norte 654','4421111122'),
('Sucursal Sur 2','Queretaro','Av. Sur 987','4421111123'),
('Sucursal Este 2','Queretaro','Av. Este 123','4421111124'),
('Sucursal Oeste 2','Queretaro','Av. Oeste 456','4421111125'),
('Sucursal Plaza 2','Queretaro','Plaza de las Americas','4421111126'),
('Sucursal de la Costa 2','Queretaro','Costa Secundaria','4421111127'),
('Sucursal Industrial 2','Queretaro','Zona Industrial 2','4421111128'),
('Sucursal Aeropuerto 2','Queretaro','Carretera Aeropuerto 2','4421111129'),
('Sucursal Universidad Autonoma de Queretaro','Queretaro','Corregidora','4421111130');

SELECT * FROM sucursales;

INSERT INTO clientes (nombre, apellido_p, apellido_m, telefono, email, calle, cp, tipo_cliente, fecha_registro) VALUES
('Juan','Perez','Lopez','4422000001','juan1@mail.com','Calle 1','76000','nuevo','2024-01-10'),
('Ana','Gomez','Martinez','4422000002','ana2@mail.com','Calle 2','76000','frecuente','2024-02-10'),
('Luis','Hernandez','Diaz','4422000003','luis3@mail.com','Calle 3','76000','casual','2024-03-10'),
('Maria','Lopez','Garcia','4422000004','maria4@mail.com','Calle 4','76000','frecuente','2024-04-10'),
('Carlos','Sanchez','Torres','4422000005','carlos5@mail.com','Calle 5','76000','nuevo','2024-05-10'),
('Elena','Ramirez','Flores','4422000006','elena6@mail.com','Calle 6','76000','casual','2024-06-10'),
('Pedro','Cruz','Morales','4422000007','pedro7@mail.com','Calle 7','76000','frecuente','2024-07-10'),
('Laura','Ortiz','Vargas','4422000008','laura8@mail.com','Calle 8','76000','nuevo','2024-08-10'),
('Jorge','Castro','Rios','4422000009','jorge9@mail.com','Calle 9','76000','casual','2024-09-10'),
('Sofia','Mendoza','Ruiz','4422000010','sofia10@mail.com','Calle 10','76000','frecuente','2024-10-10'),
('Diego','Alvarez','Reyes','4422000011','diego11@mail.com','Calle 11','76000','nuevo','2024-01-15'),
('Paula','Jimenez','Cortes','4422000012','paula12@mail.com','Calle 12','76000','casual','2024-02-15'),
('Miguel','Navarro','Silva','4422000013','miguel13@mail.com','Calle 13','76000','frecuente','2024-03-15'),
('Lucia','Delgado','Mora','4422000014','lucia14@mail.com','Calle 14','76000','nuevo','2024-04-15'),
('Raul','Ramos','Ibarra','4422000015','raul15@mail.com','Calle 15','76000','casual','2024-05-15'),
('Diana','Campos','Vega','4422000016','diana16@mail.com','Calle 16','76000','frecuente','2024-06-15'),
('Fernando','Guerrero','Soto','4422000017','fernando17@mail.com','Calle 17','76000','nuevo','2024-07-15'),
('Gabriela','Salazar','Paz','4422000018','gaby18@mail.com','Calle 18','76000','casual','2024-08-15'),
('Ricardo','Pineda','Luna','4422000019','ricardo19@mail.com','Calle 19','76000','frecuente','2024-09-15'),
('Patricia','Acosta','Nava','4422000020','patricia20@mail.com','Calle 20','76000','nuevo','2024-10-15');

SELECT * FROM clientes;

INSERT INTO empleados (nombre, apellido_p, apellido_m, salario, fecha_contratacion, sucursal_id) VALUES
('Ana','Perez','Lopez',8000,'2023-01-01',1),
('Carlos','Gomez','Martinez',8200,'2023-01-02',2),
('María','Hernandez','Diaz',8300,'2023-01-03',3),
('Juan','Lopez','Garcia',8400,'2023-01-04',4),
('Laura','Sanchez','Torres',8500,'2023-01-05',5),
('Pedro','Ramirez','Flores',8600,'2023-01-06',6),
('Sofía','Cruz','Morales',8700,'2023-01-07',7),
('Diego','Ortiz','Vargas',8800,'2023-01-08',8),
('Elena','Castro','Rios',8900,'2023-01-09',9),
('Marco','Mendoza','Ruiz',9000,'2023-01-10',10),
('Carmen','Alvarez','Reyes',9100,'2023-01-11',11),
('Roberto','Jimenez','Cortes',9200,'2023-01-12',12),
('Norbit','Navarro','Silva',9300,'2023-01-13',13),
('Rasputia','Delgado','Mora',9400,'2023-01-14',14),
('Manuel','De la Peña','Peñalosa',9500,'2023-01-15',15),
('Enrique','De la Costa','Costa',9600,'2023-01-16',16),
('Nohelia','Xshani','Seguiluz',9700,'2023-01-17',17),
('Sebastian','Salazar','Paz',9800,'2023-01-18',18),
('El primo de Marco','Mendoza','Luna',9900,'2023-01-19',19),
('La hermana de Sebastian','Salazar','Paz',10000,'2023-01-20',20);

SELECT * FROM empleados;

INSERT INTO productos (nombre, descripcion, precio, stock, stock_minimo) VALUES
('Laptop','Laptop HP',15000,10,2),
('Mouse','Mouse Logitech',300,50,10),
('Teclado','Teclado mecanico',1200,30,5),
('Monitor','Monitor 24',4000,20,3),
('Impresora','Impresora Epson',3500,15,2),
('USB','Memoria USB 32GB',150,100,20),
('Disco Duro','1TB',1800,25,5),
('Webcam','HD Webcam',900,40,5),
('Audifonos','Audifonos Gamer',700,35,5),
('Microfono','Microfono USB',800,18,3),
('Tablet','Tablet Samsung',5000,12,2),
('Celular','Smartphone',9000,14,3),
('Cargador','Cargador USB',200,60,10),
('Router','Router WiFi',1200,22,4),
('Switch','Switch 8 puertos',900,16,3),
('Camara','Camara Seguridad',2500,10,2),
('Proyector','Proyector HD',6000,8,1),
('Bocinas','Bocinas Bluetooth',1100,20,4),
('SSD','SSD 512GB',2200,18,3),
('RAM','Memoria RAM 16GB',1600,25,5);

SELECT * FROM productos;

INSERT INTO ventas (total, cliente_id, empleado_id, sucursal_id) VALUES
(500,1,1,1),
(1200,2,2,2),
(800,3,3,3),
(1500,4,4,4),
(300,5,5,5),
(2200,6,6,6),
(900,7,7,7),
(4000,8,8,8),
(600,9,9,9),
(700,10,10,10),
(1000,11,11,11),
(2000,12,12,12),
(5000,13,13,13),
(750,14,14,14),
(850,15,15,15),
(950,16,16,16),
(3000,17,17,17),
(1100,18,18,18),
(1400,19,19,19),
(1600,20,20,20);

SELECT * FROM ventas;

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1,1,1,15000,15000),
(2,2,2,300,600),
(3,3,1,1200,1200),
(4,4,1,4000,4000),
(5,5,1,3500,3500),
(6,6,5,150,750),
(7,7,1,1800,1800),
(8,8,2,900,1800),
(9,9,1,700,700),
(10,10,1,800,800),
(11,11,1,5000,5000),
(12,12,1,9000,9000),
(13,13,2,200,400),
(14,14,1,1200,1200),
(15,15,1,900,900),
(16,16,1,2500,2500),
(17,17,1,6000,6000),
(18,18,1,1100,1100),
(19,19,1,2200,2200),
(20,20,1,1600,1600);

SELECT * FROM detalle_ventas;


-- 														CONSULTAS

-- 1. VENTAS POR EMPLEADO 
-- Con Consulta|| Se unen las tabas de empleados y ventas con un JOIN, se suman los totales de ventas por
-- cada empleado y se agrupan por el id de empleado
select e.id_empleado, e.nombre, e.apellido_p, sum(v.total) as total_empleado
from empleados e join ventas v on e.id_empleado = v.empleado_id group by e.id_empleado;
-- Con Vista
select * from ventas_por_empleado;

-- 2. PRODUCTOS MAS VENDIDOS || Se unen las tablas productos y detalle_ventas con un JOIN, se suman las cantidades
-- vendidas por cada producto y se agrupan por el id del producto
select p.id_producto, p.nombre, sum(dv.cantidad) as total_vendido
from productos p join detalle_ventas dv on p.id_producto = dv.producto_id group by p.id_producto;

-- 3. CLIENTES CON COMPRAS SUPERIORES AL PROMEDIO || Se calcula el total de compras de cada cliente, luego de obtiene
-- el promedio de todas las ventas en general, despues se compara el total de compras de cada cliente con el promedio
-- de ventas en general, finalmente solo muestra a los clientes que su total de compras sea mayor al promedio
select c.id_cliente, c.nombre, sum(v.total) as compras_hechas
from clientes c join ventas v on c.id_cliente = v.cliente_id group by c.id_cliente
having compras_hechas > (select avg(total) from ventas);

-- 4. SUCURSALES CON MAYORES INGRESOS || Se unen las tablas sucursales y ventas con un JOIN, se calcula el total de
-- ventas de cada sucursal y luego se ordenan de la sucursales con los ingresos de mayor a menor
select s.id_sucursal, s.nombre, sum(v.total) as ingresos
from sucursales s join ventas v on s.id_sucursal = v.sucursal_id group by s.id_sucursal order by ingresos desc;

-- 5. VENTAS CON TOTAL || Se usa la funcion calcular_total_venta para obtener el total de ventas usando la tabla 
-- detalle_venta, luego muestra el total gurdado y el total calculado
select id_venta, calcular_total_venta(id_venta) as total_calculado from ventas;

-- 6. CLIENTES CON CLASIFICACION || Se manda a llamar la funcion clasificar_cliente, que determina en base a cuanto ha
-- gastado cada cliente en compras para clasificarlo como: NUEVO, CASUAL o FRECUENTE
select id_cliente, nombre, clasificacion_cliente(id_cliente) as tipo_cliente from clientes;

-- 7. TOTAL VENTAS POR EMPLEADO || Se agrupan las ventas por empleado y se suman los totales de cada venta
SELECT id_empleado, nombre, ventasXempleado(id_empleado) FROM empleados; -- consulta de la fucion
-- ------------------------------------------------------------------------------------------------------------------


-- 														VISTAS 

-- 1. VENTAS POR EMPLEADO

-- VERSION EN LA QUE SE HACE TODO EL PRCOESO EN LA VISTA  -------> [IVAN]
-- Se crea una vista llamada ventas_por_empleado
CREATE VIEW ventas_por_empleado AS
-- Seleccionamos los campos que queremos mostrar
SELECT 
    e.id_empleado,  -- ID del empleado
    -- Concatenamos nombre completo del empleado
    CONCAT(e.nombre, ' ', e.apellido_p, ' ', e.apellido_m) AS nombre_empleado,
    -- Contamos cuántas ventas ha realizado el empleado
    COUNT(v.id_venta) AS total_ventas,
    -- Sumamos el total de dinero generado por sus ventas
    SUM(v.total) AS monto_total
-- Indicamos de qué tabla principal vienen los datos
FROM empleados e
-- Unimos la tabla ventas con empleados usando el id del empleado
JOIN ventas v ON e.id_empleado = v.empleado_id
-- Agrupamos por empleado para que los cálculos sean por cada uno
GROUP BY e.id_empleado, nombre_empleado;


-- VERSION EN LA QUE SOLO SE MANDA A LLAMAR LA FUNCION ventasXempleado DE MAS ABAJO -------> [DIEGO HERNANDEZ]
CREATE VIEW vista_ventas_empleado AS
SELECT id_empleado, nombre, ventasXempleado(id_empleado) AS total_vendido FROM empleados; -- aqui se crea la vista para la funcion
SELECT*FROM vista_ventas_empleado; -- consulta para la vista creada
-- ------------------------------------------------------------------------------------------------------------------

-- 2. VENTAS POR SUCURSAL
-- Se crea una vista llamada ventas_por_sucursal
CREATE VIEW ventas_por_sucursal AS
-- Seleccionamos los datos que queremos mostrar
SELECT 
    s.id_sucursal,  -- ID de la sucursal
    -- Nombre de la sucursal con un alias
    s.nombre AS nombre_sucursal,
    -- Contamos cuántas ventas se realizaron en la sucursal
    COUNT(v.id_venta) AS total_ventas,
    -- Sumamos el total de dinero generado en la sucursal
    SUM(v.total) AS monto_total
-- Tabla principal: sucursales
FROM sucursales s
-- Se une con la tabla ventas usando el id de sucursal
JOIN ventas v ON s.id_sucursal = v.sucursal_id
-- Agrupamos por sucursal para obtener resultados individuales
GROUP BY s.id_sucursal, s.nombre;
-- Se manda a llamar
select * from ventas_por_sucursal;
-- ------------------------------------------------------------------------------------------------------------------

-- 3. VISTA CLIENTES TIPO
CREATE VIEW vista_clientes_tipo AS
SELECT id_cliente, nombre, clasificacion_cliente(id_cliente) AS tipo_cliente FROM clientes; -- vista donde se ocupa la funcion 
SELECT*FROM vista_clientes_tipo; -- consulta de la vista creada
-- ------------------------------------------------------------------------------------------------------------------


-- 															FUNCIONES

-- 1. TOTAL DE VENTAS POR EMPLEADO
DELIMITER $$
DROP FUNCTION IF EXISTS ventasXempleado$$
CREATE FUNCTION ventasXempleado(p_id_empleado INT) 
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE total_ventas DECIMAL(10,2);

    SELECT IFNULL(SUM(total), 0)
    INTO total_ventas
    FROM ventas
    WHERE empleado_id = p_id_empleado;

    RETURN total_ventas;
END$$
DELIMITER ;

SELECT*FROM empleados;
-- ------------------------------------------------------------------------------------------------------------------

-- 2. CLASIFICACION DE CLIENTE
delimiter $$
drop function if exists clasificacion_cliente $$
create function clasificacion_cliente(p_cliente_id int)
returns varchar(50)
deterministic
	begin
		declare v_total decimal (12, 2); -- Variable para guardar el total de compras
        select sum(total) into v_total from ventas where cliente_id = p_cliente_id; -- Obtiene el total gastado por el cliente
        set v_total = ifnull(v_total, 0); -- Si no ha comprado nada, evita el null
        return ( -- Clasificacion del tipo de cliente con CASE
			case 
				when v_total = 0 then 'Nuevo'
                when v_total < 5000 then 'Casual'
                else 'Frecuente'
			end
        );
	end $$
delimiter ;
-- ------------------------------------------------------------------------------------------------------------------



-- 														PROCEDIMIENTOS    

-- 1. REGISTRAR VENTA || Automatiza el insertar una venta, detalle_venta, ajusta el stock y calcula el total
delimiter $$
drop procedure if exists registrar_venta $$
create procedure registrar_venta(
	in p_cliente_id int,
    in p_empleado_id int,
    in p_sucursal_id int,
    in p_producto_id int,
    in p_cantidad int
)
	begin
		declare registro_precio decimal(10, 2);
        declare registro_total decimal(10, 2);
        declare registro_venta_id int;
        -- Obtiene el precio del producto
        select precio into registro_precio from productos where id_producto = p_producto_id; 
        -- Calcula el total, multiplica el precio por la cantidad
        set registro_total = registro_precio * p_cantidad; 
        -- Insertar la venta con el total iniciado en 0
        insert into ventas (total, cliente_id, empleado_id, sucursal_id) 
        values (0, p_cliente_id, p_empleado_id, p_sucursal_id);
        -- Obtener el ID generado
        set registro_venta_id = LAST_INSERT_ID(); -- Last_Insert_id() devuelve el valor del id de la venta que se generó automaticamente por la ultima sentencia INSERT hecha en ventas
        -- Insertar el detalle de la venta
        insert into detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal) 
        values (registro_venta_id, p_producto_id, p_cantidad, registro_precio, registro_total);
        -- Se acualiza la cantidad disponible del producto restando el stock original por la cantidad comprada
        update productos set stock = stock - p_cantidad where id_producto = p_producto_id;
        -- Actualizar el total de la venta usando la variable declarada
        update ventas set total = registro_total where id_venta = registro_venta_id;
	end $$
delimiter ;

-- Llamar al procedimeinto
CALL registrar_venta(1, 1, 1, 1, 2);
select * from ventas; -- Venta no. 21
select * from detalle_ventas; -- Detalle de venta no. 23
select * from productos; -- Ahora quedan 8 laptops, antes habia 9
-- -------------------------------------------------------------------------------------------------------------------

-- 2. HISTORIAL DE CLIENTE || Muestra todas las ventas de un cliente
delimiter $$
drop procedure if exists historial_cliente $$
create procedure historial_cliente(in p_cliente_id int)
	begin
		select c.nombre as cliente, v.id_venta, v.fecha, v.total from clientes c -- Seleccionar los datos a aparecer en el historial
        join ventas v on c.id_cliente = v.cliente_id -- se unen los datos de las tablas con un JOIN
        where c.id_cliente = p_cliente_id; -- Filtra por cada cliente
	end $$
delimiter ;

-- Llamar al procedimiento
CALL historial_cliente(1);
-- ------------------------------------------------------------------------------------------------------------------


-- 															TRIGGER 
-- Evita venta sin inventario
DELIMITER $$

DROP TRIGGER IF EXISTS validar_stock$$

CREATE TRIGGER validar_stock
BEFORE INSERT ON detalle_ventas
FOR EACH ROW
BEGIN
    DECLARE stock_actual INT;

    SELECT stock 
    INTO stock_actual
    FROM productos
    WHERE id_producto = NEW.producto_id;

    IF stock_actual < NEW.cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: Stock insuficiente para realizar la venta';
    END IF;

END$$

DELIMITER ;

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES (1, 1, 9999, 100, 999900); -- Registro erroneo para mostrar resultados

INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
VALUES (1, 1, 2, 100, 200); -- Registro correcto

SELECT*FROM detalle_ventas;
-- ------------------------------------------------------------------------------------------------------------------


-- 													TRANSACCIÓN [pendiente]
-- 														*poner aqui*
-- ------------------------------------------------------------------------------------------------------------------


-- 													USUARIOS Y ROLES [pendiente]
--      												*poner aqui*
-- ------------------------------------------------------------------------------------------------------------------

-- 													INDICES

-- 1. Índice en ventas por empleado
-- Sirve para consultas como:
-- ventas por empleado
-- joins con empleados
CREATE INDEX idx_ventas_empleado
ON ventas(empleado_id);


-- 2. Índice en ventas por sucursal
-- Sirve para consultas como:
-- vistas de ventas por sucursal
-- filtros por sucursal
CREATE INDEX idx_ventas_sucursal
ON ventas(sucursal_id);


-- 3. Índice en clientes por tipo_cliente
-- clasificaciones
-- filtros (nuevo, frecuente, etc.)
CREATE INDEX idx_clientes_tipo
ON clientes(tipo_cliente);
-- ------------------------------------------------------------------------------------------------------------------