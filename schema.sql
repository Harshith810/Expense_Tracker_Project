CREATE TABLE expenses (
  id NUMBER PRIMARY KEY,
  amount NUMBER(10,2),
  category VARCHAR2(100),
  description VARCHAR2(500),
  expense_date DATE
);

-- if sequence does not exist, create it:
BEGIN
  EXECUTE IMMEDIATE('CREATE SEQUENCE expenses_seq START WITH 1 INCREMENT BY 1');
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE = -955 THEN NULL; ELSE RAISE; END IF;
END;
/

CREATE OR REPLACE TRIGGER expenses_trigger
BEFORE INSERT ON expenses
FOR EACH ROW
BEGIN
  SELECT expenses_seq.NEXTVAL INTO :NEW.id FROM dual;
END;
/