DROP DATABASE IF EXISTS agendamento_faculdade;
CREATE DATABASE agendamento_faculdade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE agendamento_faculdade;
CREATE TABLE usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash CHAR(64) NOT NULL,
    tentativas INT NOT NULL DEFAULT 0,
    bloqueado TINYINT(1) NOT NULL DEFAULT 0,
    bloqueado_em DATETIME DEFAULT NULL,
    papel ENUM('aluno','admin') NOT NULL DEFAULT 'aluno',
    criado_em DATETIME NOT NULL DEFAULT NOW(),
    atualizado_em DATETIME DEFAULT NULL
);
CREATE TABLE curso (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome_curso VARCHAR(100) NOT NULL
);
CREATE TABLE aluno (
    ra_aluno INT PRIMARY KEY,
    nome_aluno VARCHAR(100) NOT NULL,
    email_aluno VARCHAR(150) NOT NULL UNIQUE,
    telefone VARCHAR(20),
    termo VARCHAR(20),
    id_curso INT NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);
CREATE TABLE instalacao (
    id_instalacao INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('campo','quadra') NOT NULL,
    capacidade INT DEFAULT 0,
    descricao TEXT,
    deletado TINYINT(1) NOT NULL DEFAULT 0,
    criado_em DATETIME NOT NULL DEFAULT NOW(),
    atualizado_em DATETIME DEFAULT NULL
);
CREATE TABLE reserva (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    ra_aluno INT NOT NULL,
    id_instalacao INT NOT NULL,
    id_curso INT NOT NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    status ENUM('agendada','confirmada','concluida','cancelada','no_show') NOT NULL DEFAULT 'agendada',
    created_by INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT NOW(),
    updated_at DATETIME DEFAULT NULL,
    deletado TINYINT(1) NOT NULL DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by INT DEFAULT NULL,
    FOREIGN KEY (ra_aluno) REFERENCES aluno(ra_aluno),
    FOREIGN KEY (id_instalacao) REFERENCES instalacao(id_instalacao),
    FOREIGN KEY (id_curso) REFERENCES curso(id_curso),
    FOREIGN KEY (created_by) REFERENCES usuario(id_usuario),
    FOREIGN KEY (deleted_by) REFERENCES usuario(id_usuario)
);
CREATE TABLE log_operacao (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    tabela_alvo VARCHAR(100) NOT NULL,
    tipo_operacao ENUM('INSERT','UPDATE','DELETE','SOFT_DELETE','LOGIN','SENHA','OTHER') NOT NULL,
    referencia_id INT NULL,
    dados_antigos TEXT NULL,
    dados_novos TEXT NULL,
    usuario_id INT NULL,
    criado_em DATETIME NOT NULL DEFAULT NOW(),
    INDEX (tabela_alvo),
    FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario)
);

DROP PROCEDURE IF EXISTS sp_ValidaLogin;
DELIMITER //

CREATE PROCEDURE sp_ValidaLogin(IN p_usuario VARCHAR(100), IN p_senha CHAR(64))
BEGIN
    DECLARE v_id INT;
    DECLARE v_bloqueado TINYINT;
    DECLARE v_tentativas INT;
    
    INSERT INTO log_operacao (tabela_alvo, tipo_operacao, referencia_id, dados_novos, usuario_id)
	VALUES ('usuario', 'LOGIN', v_id, 'Login tentado', v_id);


    SELECT id_usuario, bloqueado, tentativas INTO v_id, v_bloqueado, v_tentativas
    FROM usuario WHERE usuario = p_usuario;

    IF v_id IS NULL THEN
        SELECT 'erro' AS status, 'Usuário não encontrado' AS mensagem, NULL AS id_usuario;
    ELSEIF v_bloqueado = 1 THEN
        SELECT 'bloqueado' AS status, 'Usuário bloqueado' AS mensagem, v_id AS id_usuario;
    ELSE
        IF EXISTS (
            SELECT 1 FROM usuario WHERE usuario = p_usuario AND senha_hash = p_senha
        ) THEN
            UPDATE usuario SET tentativas = 0, ultimo_login = NOW() WHERE id_usuario = v_id;
            SELECT 'sucesso' AS status, 'Login válido' AS mensagem, v_id AS id_usuario;
        ELSE
            SET v_tentativas = v_tentativas + 1;
            UPDATE usuario SET tentativas = v_tentativas WHERE id_usuario = v_id;
            IF v_tentativas >= 3 THEN
                UPDATE usuario SET bloqueado = 1, bloqueado_em = NOW() WHERE id_usuario = v_id;
                SELECT 'bloqueado' AS status, 'Usuário bloqueado após 3 tentativas' AS mensagem, v_id AS id_usuario;
            ELSE
                SELECT 'erro' AS status, CONCAT('Senha inválida. Tentativas: ', v_tentativas) AS mensagem, v_id AS id_usuario;
            END IF;
        END IF;
    END IF;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_DesbloquearUsuario;
DROP PROCEDURE IF EXISTS sp_TrocarSenha;

DELIMITER //

DROP PROCEDURE IF EXISTS sp_DesbloquearUsuario;
DELIMITER //

CREATE PROCEDURE sp_DesbloquearUsuario(IN p_id INT)
BEGIN
  UPDATE usuario
  SET bloqueado = 0,
      tentativas = 0,
      bloqueado_em = NULL
  WHERE id_usuario = p_id;

  SELECT 'sucesso' AS status, 'Usuário desbloqueado' AS mensagem;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_TrocarSenha;
DELIMITER //

CREATE PROCEDURE sp_TrocarSenha(IN p_id INT, IN p_nova CHAR(64))
BEGIN
  UPDATE usuario
  SET senha_hash = p_nova,
      atualizado_em = NOW()
  WHERE id_usuario = p_id;

  INSERT INTO log_operacao (tabela_alvo, tipo_operacao, referencia_id, dados_novos, usuario_id)
  VALUES ('usuario', 'SENHA', p_id, 'Senha alterada', p_id);

  SELECT 'sucesso' AS status, 'Senha atualizada' AS mensagem;
END //

DELIMITER ;


CALL sp_DesbloquearUsuario(1);
CALL sp_TrocarSenha(1, REPEAT('x', 64));
DELIMITER //

DROP PROCEDURE IF EXISTS sp_CriarReserva; 
DELIMITER //

CREATE PROCEDURE sp_CriarReserva(
    IN p_ra INT,
    IN p_instalacao INT,
    IN p_curso INT,
    IN p_inicio DATETIME,
    IN p_fim DATETIME,
    IN p_created_by INT
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_id_reserva INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_msg VARCHAR(255);

    IF p_inicio >= p_fim THEN
        SET v_status = 'erro';
        SET v_msg = 'Intervalo inválido: início >= fim';
        SET v_id_reserva = NULL;
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM reserva
        WHERE id_instalacao = p_instalacao
          AND status IN ('agendada','confirmada')
          AND NOT (p_fim <= inicio OR p_inicio >= fim);

        IF v_count > 0 THEN
            SET v_status = 'erro';
            SET v_msg = CONCAT('Conflito com outra reserva: ', v_count);
            SET v_id_reserva = NULL;
        ELSE
            INSERT INTO reserva (ra_aluno, id_instalacao, id_curso, inicio, fim, created_by)
            VALUES (p_ra, p_instalacao, p_curso, p_inicio, p_fim, p_created_by);

            SET v_id_reserva = LAST_INSERT_ID();

            INSERT INTO log_operacao (
              tabela_alvo,
              tipo_operacao,
              referencia_id,
              dados_novos,
              usuario_id
            )
            VALUES (
              'reserva',
              'INSERT',
              v_id_reserva,
              CONCAT('inicio: ', p_inicio, ', fim: ', p_fim),
              p_created_by
            );

            SET v_status = 'sucesso';
            SET v_msg = 'Reserva criada com sucesso';
        END IF;
    END IF;

    SELECT v_status AS status, v_msg AS mensagem, v_id_reserva AS id_reserva;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_ExcluirReserva;
DELIMITER //

CREATE PROCEDURE sp_ExcluirReserva(IN p_id INT, IN p_usuario INT)
BEGIN
  UPDATE reserva
  SET status = 'cancelada',
      updated_at = NOW(),
      updated_by = p_usuario
  WHERE id_reserva = p_id;

  INSERT INTO log_operacao (tabela_alvo, tipo_operacao, referencia_id, dados_novos, usuario_id)
  VALUES ('reserva', 'SOFT_DELETE', p_id, 'Reserva cancelada', p_usuario);

  SELECT 'sucesso' AS status, 'Reserva cancelada com sucesso' AS mensagem;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER tr_reserva_update AFTER UPDATE ON reserva
FOR EACH ROW
BEGIN
    IF OLD.deletado = 0 AND NEW.deletado = 1 THEN
        INSERT INTO log_operacao (tabela_alvo, tipo_operacao, referencia_id, dados_antigos, dados_novos, usuario_id)
        VALUES ('reserva', 'SOFT_DELETE', OLD.id_reserva, 'Soft delete aplicado', NULL, NEW.deleted_by);
    END IF;
END //

DELIMITER ;
DROP PROCEDURE IF EXISTS sp_BuscarReservasDoUsuario;
DELIMITER //

CREATE PROCEDURE sp_BuscarReservasDoUsuario (
  IN p_usuario_id INT
)
BEGIN
  SELECT
    r.id_reserva,
    r.ra_aluno,
    r.id_instalacao,
    i.nome AS instalacao,
    r.id_curso,
    r.inicio,
    r.fim,
    r.status,
    a.nome_aluno AS nome_aluno
  FROM reserva r
  JOIN instalacao i ON i.id_instalacao = r.id_instalacao
  LEFT JOIN aluno a ON a.ra_aluno = r.ra_aluno
  WHERE r.created_by = p_usuario_id
    AND r.status != 'cancelada'
  ORDER BY r.inicio DESC;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS sp_BuscarReservasPorInstalacaoData;
DELIMITER //

CREATE PROCEDURE sp_BuscarReservasPorInstalacaoData (
  IN p_instalacao_id INT,
  IN p_data DATE
)
BEGIN
  SELECT
    r.id_reserva,
    r.ra_aluno,
    r.inicio,
    r.fim,
    a.nome_aluno
  FROM reserva r
  LEFT JOIN aluno a ON a.ra_aluno = r.ra_aluno
  WHERE r.id_instalacao = p_instalacao_id
    AND r.inicio >= CONCAT(p_data, ' 00:00:00')
    AND r.inicio < CONCAT(DATE_ADD(p_data, INTERVAL 1 DAY), ' 00:00:00');
END //

DELIMITER ;
INSERT INTO usuario (usuario, email, senha_hash, papel)
VALUES ('admin', 'admin@faculdade.com', REPEAT('a', 64), 'admin');

INSERT INTO curso (nome_curso)
VALUES ('Educação Física');

INSERT INTO aluno (ra_aluno, nome_aluno, email_aluno, telefone, termo, id_curso, id_usuario)
VALUES (1, 'João Silva', 'joao@aluno.com', '11999999999', '1º', 1, 1);


CALL sp_DesbloquearUsuario(2);

DELIMITER //
CREATE PROCEDURE sp_AtualizarReserva(
  IN p_id INT,
  IN p_inicio DATETIME,
  IN p_fim DATETIME,
  IN p_status VARCHAR(20),
  IN p_usuario INT
)
BEGIN
  DECLARE v_antigo TEXT;

  SELECT CONCAT('inicio: ', inicio, ', fim: ', fim, ', status: ', status)
  INTO v_antigo
  FROM reserva WHERE id_reserva = p_id;

  UPDATE reserva
  SET inicio = p_inicio,
      fim = p_fim,
      status = p_status,
      updated_at = NOW(),
      updated_by = p_usuario
  WHERE id_reserva = p_id;

  INSERT INTO log_operacao (tabela_alvo, tipo_operacao, referencia_id, dados_antigos, dados_novos, usuario_id)
  VALUES ('reserva', 'UPDATE', p_id, v_antigo, CONCAT('inicio: ', p_inicio, ', fim: ', p_fim, ', status: ', p_status), p_usuario);
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_reserva_auditoria AFTER UPDATE ON reserva
FOR EACH ROW
BEGIN
  IF OLD.inicio != NEW.inicio OR OLD.fim != NEW.fim OR OLD.status != NEW.status THEN
    INSERT INTO log_operacao (tabela_alvo, tipo_operacao, referencia_id, dados_antigos, dados_novos, usuario_id)
    VALUES (
      'reserva',
      'UPDATE',
      NEW.id_reserva,
      CONCAT('inicio: ', OLD.inicio, ', fim: ', OLD.fim, ', status: ', OLD.status),
      CONCAT('inicio: ', NEW.inicio, ', fim: ', NEW.fim, ', status: ', NEW.status),
      NEW.updated_by
    );
  END IF;
END //
DELIMITER ;


DELIMITER //
CREATE PROCEDURE sp_ConsultarLogs(
  IN p_usuario INT,
  IN p_tipo VARCHAR(20),
  IN p_data DATE
)
BEGIN
  SELECT * FROM log_operacao
  WHERE (usuario_id = p_usuario OR p_usuario IS NULL)
    AND (tipo_operacao = p_tipo OR p_tipo IS NULL)
    AND (DATE(criado_em) = p_data OR p_data IS NULL)
  ORDER BY criado_em DESC;
END //
DELIMITER ;

ALTER TABLE reserva ADD COLUMN updated_by INT DEFAULT NULL;









