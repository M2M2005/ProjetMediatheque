<?php

require_once "Model.php";

class ModelEmprunt extends Model {
    static $object = "emprunt";
    static $primary = "idLivre";
    public $idAdherent;
    public $idLivre;

    public static function numberOfEmprunts($idAdherent) {
        try {
            $pdo = Model::$pdo;
            $sql = "SELECT COUNT(*) as count FROM emprunt WHERE idAdherent = :idAdherent";
            $req_prep = $pdo->prepare($sql);
            $values = array("idAdherent" => $idAdherent);
            $req_prep->execute($values);
            $result = $req_prep->fetch(PDO::FETCH_ASSOC);
            return $result['count'];
        } catch (PDOException $e) {
            error_log("Erreur dans ModelEmprunt::numberOfEmprunts: " . $e->getMessage());
            return null;
        }
    }

    public static function selectOfAdherent($idAdherent) {
        try {
            $pdo = Model::$pdo;
            $sql = "SELECT * FROM emprunt WHERE idAdherent = :idAdherent";
            $req_prep = $pdo->prepare($sql);
            $values = array("idAdherent" => $idAdherent);
            $req_prep->execute($values);
            return $req_prep->fetchAll(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            return [];
        }
    }
}