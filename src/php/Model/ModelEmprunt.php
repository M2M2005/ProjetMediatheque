<?php

require_once "Model.php";

class ModelEmprunt extends Model {
    static $object = "emprunt";
    static $primary = "idLivre";
    public $idAdherent;
    public $idLivre;
}