<?php

require_once('Conf.php');

class Model
{

    public static $pdo;

    public static function init_pdo()
    {
        $host = Conf::getHostname();
        $dbname = Conf::getDatabase();
        $login = Conf::getLogin();
        $pass = Conf::getPassword();
        $port   = Conf::getPort();
        try {
            // connexion à la base de données
            // le dernier argument sert à ce que toutes les chaines de charactères
            // en entrée et sortie de MySql soit dans le codage UTF-8
            self::$pdo = new PDO("mysql:host=$host;dbname=$dbname;port=$port", $login, $pass, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8"));
            // on active le mode d'affichage des erreurs, et le lancement d'exception en cas d'erreur
            self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $ex) {
            echo $ex->getMessage();
            die("Problème lors de la connexion à la base de données.");
        }
    }

    public static function selectAll()
    {
        try {
            $pdo = self::$pdo;
            $table_name = static::$object;
            $class_name = 'Model' . ucfirst(static::$object);
            $sql = "SELECT * from $table_name";
            $rep = $pdo->query($sql);
            $rep->setFetchMode(PDO::FETCH_CLASS, $class_name);
            return $rep->fetchAll();
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]); // affiche un message d'erreur
            return null;
        }
    }

    public static function selectAllDisponible()
    {
        try {
            $pdo = self::$pdo;
            $table_name = static::$object;
            $primary_key = static::$primary;
            $class_name = 'Model' . ucfirst(static::$object);
            $sql = "SELECT * FROM $table_name WHERE $primary_key NOT IN (SELECT idLivre FROM emprunt)";

            $rep = $pdo->query($sql);
            $rep->setFetchMode(PDO::FETCH_CLASS, $class_name);
            return $rep->fetchAll();
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]);
            return null;
        }
    }

    public static function select($primary)
    {
        try {
            $table_name = static::$object;
            $class_name = 'Model' . ucfirst(static::$object);
            $primary_key = static::$primary;
            $sql = "SELECT * from $table_name WHERE $primary_key=:primary";
            $req_prep = Model::$pdo->prepare($sql);

            $values = array(
                "primary" => $primary
            );
            $req_prep->execute($values);

            $req_prep->setFetchMode(PDO::FETCH_CLASS, $class_name);
            $tab_results = $req_prep->fetchAll();

            if (empty($tab_results))
                return false;
            return $tab_results[0];
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]);
            return null;
        }
    }

    public static function delete($primary)
    {
        try {
            $table_name = static::$object;
            $primary_key = static::$primary;
            $sql = "DELETE FROM $table_name WHERE $primary_key=:primary;";
            $req_prep = Model::$pdo->prepare($sql);

            $values = array(
                "primary" => $primary
            );

            return $req_prep->execute($values);
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]);
            return false;
        }
    }

    public static function update($data)
    {
        try {
            $table_name = static::$object;
            $primary_key = static::$primary;
            $set_parts = array();
            foreach ($data as $key => $value) {
                $set_parts[] = "$key=:$key";
            }
            $set_string = join(',', $set_parts);
            $sql = "UPDATE $table_name SET $set_string WHERE $primary_key=:$primary_key";
            $req_prep = Model::$pdo->prepare($sql);

            return $req_prep->execute($data);
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]);
            return false;
        }
    }

    public static function save($data)
    {
        try {
            $table = static::$object;

            $attributes = array_keys($data);
            $into_string = '(' . join(',', $attributes) . ')';

            function my_prepend($s)
            {
                return ":" . $s;
            }

            $values_string = '(' . join(',', array_map("my_prepend", $attributes)) . ')';

            $sql = "INSERT INTO $table $into_string VALUES $values_string";
            $req = self::$pdo->prepare($sql);
            self::$pdo->beginTransaction();
            $req->execute($data);
            $id = self::$pdo->lastInsertId();
            self::$pdo->commit();
            return $id;
        } catch (PDOException $e) {
            echo json_encode(["error" => $e->getMessage()]);
            return null;
        }
    }
}

Model::init_pdo();
