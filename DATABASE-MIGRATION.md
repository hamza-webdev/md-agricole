# 📦 Migration de Base de Données - MD Agricole

## 🎯 Objectif
Transférer votre base de données PostgreSQL locale `md_agricole_db` vers votre VPS avec la base `md_agricole`.

## 📋 Méthodes disponibles

### 🔄 Méthode 1 : Export/Import manuel (Recommandée)

#### **Étape 1 : Export local**
```bash
# Sur votre machine locale
./export-database.sh
```

**Ce script va :**
- ✅ Détecter automatiquement votre base (Docker ou locale)
- ✅ Créer 3 fichiers d'export :
  - `md_agricole_export_YYYYMMDD_HHMMSS.sql` (complet)
  - `md_agricole_data_only_YYYYMMDD_HHMMSS.sql` (données seulement)
  - `md_agricole_schema_only_YYYYMMDD_HHMMSS.sql` (structure seulement)
- ✅ Optionnellement compresser en `.tar.gz`

#### **Étape 2 : Copie vers VPS**
```bash
# Copier le fichier sur votre VPS
scp md_agricole_export_YYYYMMDD_HHMMSS.sql root@votre-vps-ip:/opt/md-agricole/
```

#### **Étape 3 : Import sur VPS**
```bash
# Sur votre VPS
cd /opt/md-agricole
./import-database.sh md_agricole_export_YYYYMMDD_HHMMSS.sql
```

### 🚀 Méthode 2 : Migration directe (Automatique)

```bash
# Sur votre machine locale
./migrate-to-vps.sh <IP_VPS> [<utilisateur>]

# Exemple
./migrate-to-vps.sh 192.168.1.100 root
```

**Ce script fait tout automatiquement :**
- ✅ Export local
- ✅ Copie SSH vers VPS
- ✅ Import sur VPS
- ✅ Vérification de santé
- ✅ Nettoyage

## 🔧 Configuration requise

### **Sur votre machine locale :**
- PostgreSQL ou Docker avec votre base `md_agricole_db`
- Accès SSH à votre VPS
- Scripts : `export-database.sh`, `migrate-to-vps.sh`

### **Sur votre VPS :**
- Docker et docker-compose installés
- Application MD Agricole déployée
- Script : `import-database.sh`

## 📊 Données qui seront migrées

### **Tables principales :**
- ✅ **users** - Utilisateurs et admins
- ✅ **categories** - Catégories de produits
- ✅ **products** - Produits agricoles
- ✅ **orders** - Commandes clients
- ✅ **order_items** - Articles des commandes
- ✅ **invoices** - Factures
- ✅ **payments** - Paiements

### **Données préservées :**
- ✅ Comptes utilisateurs (mots de passe hashés)
- ✅ Historique des commandes
- ✅ Factures et paiements
- ✅ Stock des produits
- ✅ Configuration des catégories

## ⚠️ Précautions importantes

### **Avant la migration :**
1. **Sauvegarde VPS** - Le script crée automatiquement une sauvegarde
2. **Arrêt temporaire** - L'application VPS sera arrêtée pendant l'import
3. **Vérification des données** - Assurez-vous que vos données locales sont à jour

### **Après la migration :**
1. **Test de connexion** - Vérifiez que l'application fonctionne
2. **Vérification des données** - Contrôlez que toutes les données sont présentes
3. **Test des fonctionnalités** - Testez login, commandes, factures

## 🛠️ Dépannage

### **Si l'export local échoue :**
```bash
# Vérifier que la base est accessible
docker ps | grep md_agricole_db

# Ou pour PostgreSQL local
pg_isready -h localhost -p 5432 -U md_user -d md_agricole_db
```

### **Si l'import VPS échoue :**
```bash
# Vérifier les logs Docker
docker-compose logs postgres

# Vérifier l'espace disque
df -h

# Restaurer la sauvegarde automatique
docker exec -i md-agricole-db psql -U md_user -d md_agricole < backup_before_import_*.sql
```

### **Si l'application ne redémarre pas :**
```bash
# Voir les logs
docker-compose logs app

# Redémarrer manuellement
docker-compose down
docker-compose up -d

# Régénérer Prisma
docker-compose exec app npx prisma generate
```

## 📈 Vérification post-migration

### **1. Test de santé**
```bash
curl https://mdagricole.zidani.org/api/health
```

### **2. Vérification des données**
```bash
# Statistiques rapides
docker-compose exec postgres psql -U md_user -d md_agricole -c "
SELECT 
    'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices;
"
```

### **3. Test de connexion admin**
- 🌐 Aller sur : https://mdagricole.zidani.org/admin
- 🔑 Login : admin@mdagricole.tn / admin123
- ✅ Vérifier que le dashboard affiche les bonnes données

## 🔄 Migration incrémentale

Pour des mises à jour régulières, vous pouvez :

### **1. Export des données récentes seulement**
```bash
# Modifier export-database.sh pour ajouter des filtres de date
# Exemple : données des 7 derniers jours
```

### **2. Synchronisation automatique**
```bash
# Ajouter au crontab pour synchronisation quotidienne
0 3 * * * cd /path/to/app && ./migrate-to-vps.sh VPS_IP
```

## 📞 Support

En cas de problème :
1. **Vérifiez les logs** avec les commandes de dépannage
2. **Consultez les sauvegardes** automatiques créées
3. **Testez étape par étape** avec la méthode manuelle

---

**🎉 Votre base de données sera maintenant synchronisée entre votre environnement local et votre VPS !**
