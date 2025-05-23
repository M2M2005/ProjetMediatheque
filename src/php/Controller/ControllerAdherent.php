<?php

require_once "../Model/ModelAdherent.php";
require_once "../Model/Model.php";
Model::init_pdo();
$action = $_GET["action"] ?? "read";
$actions = get_class_methods("ControllerAdherent");
if (in_array($action, $actions))
    ControllerAdherent::$action();

class ControllerAdherent
{

    static function readAll()
    {
        header('Content-Type: application/json');
        try {
            $adherents = ModelAdherent::selectAll();
            echo json_encode($adherents);
        } catch (Exception $e) {
            echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
        }
    }

    static function create()
    {
        $adherent = [
            "nomAdherent" => $_POST["nom"]
        ];
        $id = ModelAdherent::save($adherent);
        echo json_encode($id);
    }

    static function delete()
    {
        $id = $_GET["id"];
        ModelAdherent::delete($id);
    }

}