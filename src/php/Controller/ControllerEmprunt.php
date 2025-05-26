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
                $idAdherent = $_GET["idAdherent"] ?? null;
                if ($idAdherent === null) {
                    echo json_encode(["error" => "L'ID de l'adhérent est manquant."]);
                    return;
                }
                $count = ModelEmprunt::numberOfEmprunts($idAdherent);
                if ($count !== null) {
                    echo json_encode(["count" => $count]);
                } else {
                    echo json_encode(["error" => "Une erreur est survenue lors de la récupération du nombre d'emprunts."]);
                }
            } catch (Exception $e) {
                echo json_encode(["error" => $e->getMessage() . " (SQLSTATE: " . $e->getCode() . ")"]);
            }
        }

    static function selectOf()
    {
        header('Content-Type: application/json');
        $idAdherent = $_GET["idAdherent"] ?? null;
        if ($idAdherent === null) {
            echo json_encode(["error" => "L'ID de l'adhérent est manquant."]);
            return;
        }
        try {
            $emprunts = ModelEmprunt::selectOfAdherent($idAdherent);
            echo json_encode($emprunts);
        } catch (Exception $e) {
            echo json_encode(["error" => "Erreur lors de la récupération des emprunts."]);
        }
    }
}