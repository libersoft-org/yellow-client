# Yellow Client - installation

## 1. Download the latest version of this software

These are the installation instructions of this software for the different Linux distributions.

Log in as "root" on your server and run the following commands to download the necessary dependencies and the latest version of this software from GitHub:

### Debian / Ubuntu Linux

```sh
apt update
apt -y upgrade
apt -y install git
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/yellow-client.git
cd yellow-server/
bun i
```

### CentOS / RHEL / Fedora Linux

```sh
dnf -y update
dnf -y install git
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/yellow-client.git
cd yellow-client/
bun i
```

## 2. Use this software

If you'd like to **build this software from source codes, use this command:

```sh
bun --bun run build
```

... and then move the content of your "**build**" folder to your web server.

If you'd like to **run this software in developer mode**, use this command:

```sh
bun --bun run dev -- --host
```

... and then navigate to: http://YOUR_SERVER_ADDRESS:5137/ in your browser.
