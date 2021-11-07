# test if mysql is installed correctly
type mysql >/dev/null 2>&1 && mysql_found="true" || mysql_found="false"

# Tell the user the status of mysql installation
if [ $mysql_found = "true" ]; then
    echo "Mysql/mariadb installed"
else 
    echo "Mysql/mariadb not installed"
    exit 1
fi

read -p "Mysql/mariadb Admin user [default = root]: " admin_user
if [$admin_user = ""]; then admin_user=root ; fi
read -p "Mysql/mariadb ${admin_user} password: " admin_password

read -p "Run sudo on mysql command when create database [Y/N]: " admin_as_root

if [ $admin_as_root = "Y" ] || [ $admin_as_root = "y" ]; then
    sudo mysql --user=$admin_user --password=$admin_password < adminlte.sql
else
    mysql --user=$admin_user --password=$admin_password < adminlte.sql
fi
