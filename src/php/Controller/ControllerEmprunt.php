<?php

require_once "../Model/ModelEmprunt.php";
require_once "../Model/Model.php";
Model::init_pdo();
$action = $_GET["action"] ?? "read";
$actions = get_class_methods("ControllerEmprunt");
if (in_array($action, $actions))
    ControllerEmprunt::$action();

class ControllerEmprunt
{

    static function readAll()
    {
        header('Content-Type: application/json');
        try {
            $emprunts = ModelEmprunt::selectAll();
            echo json_encode($emprunts);
        } catch (Exception $e) {
            echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
        }
    }

    static function create()
    {
        $emprunt = [
            "idAdherent" => $_POST["idAdherent"],
            "idLivre" => $_POST["idLivre"]
        ];
        $id = ModelEmprunt::save($emprunt);
        echo json_encode($id);
    }

    static function delete()
    {
        $idLivre = $_GET["idLivre"];
        ModelEmprunt::delete($idLivre);
    }

    static function nomberOfEmprunts()
    {
        header('Content-Type: application/json');
        try {
            $count = ModelEmprunt::numberOf($_idAdherent = $_GET["idAdherent"]);
            echo json_encode(["count" => $count]);
        } catch (Exception $e) {
            echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
        }
    }
}