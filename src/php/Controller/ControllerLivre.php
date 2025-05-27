<?php

require_once "../Model/ModelLivre.php";
require_once "../Model/Model.php";
Model::init_pdo();
$action = $_GET["action"] ?? "read";
$actions = get_class_methods("ControllerLivre");
if (in_array($action, $actions))
    ControllerLivre::$action();

class ControllerLivre
{

    static function readAll()
    {
        header('Content-Type: application/json');
        try {
            $livres = ModelLivre::selectAll();
            echo json_encode($livres);
        } catch (Exception $e) {
            echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
        }
    }

    static function readAllDisponible()
        {
            header('Content-Type: application/json');
            try {
                $livres = ModelLivre::selectAllDisponible();
                echo json_encode($livres);
            } catch (Exception $e) {
                echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
            }
        }

    static function create()
    {
        $livre = [
            "titreLivre" => $_POST["titre"]
        ];
        $id = ModelLivre::save($livre);
        echo json_encode($id);
    }

    static function delete()
    {
        $id = $_GET["id"];
        ModelLivre::delete($id);
    }

    static function select()
        {
            header('Content-Type: application/json');
            $id = $_GET["id"] ?? null;
            if ($id === null) {
                echo json_encode(["error" => "L'ID du livre est manquant."]);
                return;
            }
            try {
                $livre = ModelLivre::select($id);
                if ($livre) {
                    echo json_encode($livre);
                } else {
                    echo json_encode(["error" => "Livre non trouvé."]);
                }
            } catch (Exception $e) {
                echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
            }
        }
}