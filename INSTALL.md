# Yellow Client - installation

## 1. Download the latest version of this software

These are the installation instructions of this software for the different Linux distributions.

Log in as "root" on your server and run the following commands to download the necessary dependencies and the latest version of this software from GitHub:

### Debian / Ubuntu Linux

```sh
apt update
apt -y upgrade
apt -y install git openssl
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/yellow-client.git
cd yellow-client/
bun i
```

### CentOS / RHEL / Fedora Linux

```sh
dnf -y update
dnf -y install git openssl
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc
git clone https://github.com/libersoft-org/yellow-client.git
cd yellow-client/
bun i
```

## 2. Use this software

If you'd like to **build this software from source code:

### Set up the URL path:

Set the base URL path where you'd like to store your build on your web server by editing the **svelte.config.js** file:

For example for **/client/**:

```js
base: process.env.NODE_ENV === 'production' ? '/client' : '',
```

or for **/**:

```js
base: process.env.NODE_ENV === 'production' ? '' : '',
```

After that use this command to build it:

```sh
./build.sh
```

... and then move the content of your "**build**" folder to your web server.

If you'd like to **run this software in developer mode**, first you need to create HTTPS certificate keys:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -days $(expr '(' $(date -d 2999/01/01 +%s) - $(date +%s) + 86399 ')' / 86400) -subj "/" -keyout server.key -out server.crt
```

... then use this command to start the server in development mode:

```sh
./start-dev.sh
```

... and then navigate to: https://YOUR_SERVER_ADDRESS:3000/ in your browser. Browser will show the certificate error, just skip it.
