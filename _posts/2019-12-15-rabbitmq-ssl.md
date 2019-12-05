---
layout: post
title:  "SSL and Client Certificate Authentication in Rabbit MQ with .NET Standard 2.1"
comments-enabled: true
---

## Introduction

<!-- excerpt-start -->
Rabbit MQ can be configured to use SSL for secure traffic encryption, and as a secure alternative to basic username/password for client authentication, however it can be difficult to get set up. This post aims to explain the process clearer and in a more concise way compared to the documentation.

I will be explaining how I installed Rabbit MQ on a Raspberry Pi running Raspbian, and set up SSL and client certificate authentication from a .NET Core 3.0 Console app and a .NET Standard 2.1 library. Some working knowledge of Rabbit MQ is assumed; if you are unfamiliar with Rabbit MQ, I recommend running through some tutorials on the [official website][rabbitmq-url].
<!-- excerpt-end -->

## Client Authentication in Rabbit MQ
There are two authentication mechanism options available in Rabbit MQ - basic username/password and certificate authentication. Basic authentication is the default, but is not the most secure of the two available options. In my opinion, certificate authentication is recommended for a few reasons:

- It separates out the responsibility of authentication from the client connection code, meaning clients can be updated to use new authentication credentials transparently, without any need for a re-deploy of the application.
- For enhanced security, and similar to how a policy can be set which requires a user's password to be changed regularly, certificates can be set with short expiry dates and regularly regenerated and reissued. This helps ensure that only clients who should be able to, can connect to the Rabbit MQ server. This again is a transparent process, assuming the certificates are stored in the same location on the client's machine, are generated using the same trusted Certificate Authority (CA) and the private key password is unchanged.
- Many organisations already have their own internal CA, so being able to generate and manage certificates should not be a big undertaking and allows for these certificates to be centrally controlled by a dedicated Systems Administration team.

## SSL vs Peer Verification vs Client Certificate Authentication
Getting Rabbit MQ to work over SSL can be tricky, and it is not helped by a confusion of terminology. SSL, Peer Verification and Certificate Authentication are very similar, but play a different role in the configuration of SSL in Rabbit MQ.

### SSL
Enabling SSL is allowing Rabbit MQ to accept connections on a secure port, ensuring traffic to and from the server is encrypted. Just like HTTPS, the server presents its certificate containing the public key which is used the initiate the TLS handshake. I won't be going into any detail into SSL any further in this post, but there are plenty of resources online to help, including this [YouTube][ssl-youtube-video-url] video.

The exact server configuration required will be described later, but in short, SSL is enabled on Rabbit MQ by setting the desired port and pointing it to a pair of public and private key files, and a Certificate Authority file which signed the certificate/key pair. For a trusted connection to be established, the client applications will need to trust the same Certificate Authority.

### Peer Verification
Peer Verification builds on top of SSL, and is a way for Rabbit MQ to verify that the clients which are attempting to connect can be trusted, that is -- they present a certificate which is signed by a Certificate Authority which the server also trusts. This helps ensure that only trusted clients can connect to the broker and helps prevent against Man-in-the-Middle attacks.

If the client is not able to supply a trusted certificate, then the server will reject the connection. The exception to this is if the `fail_if_no_peer_cert` configuration option is set to `verify_none`, in which case, the server will allow the connection.

Peer Verification is not required in order to use SSL, but it is highly recommended, at least in production environments.

### Client Certificate Authentication
SSL can also be used as a mechanism for clients to authenticate with the broker instead of the default username and password mechanism. In order for clients to authenticate with SSL, they must present a certificate to the server which is signed by a trusted CA and which contains the login username as the Common Name (CN) or Subject Alternative Name (SAN). More details on how to configure this later.

[rabbitmq-url]: https://www.rabbitmq.com/getstarted.html
[ssl-youtube-video-url]: https://youtu.be/T4Df5_cojAs

Re-installed Raspbian.
`apt-get update` to update local package repo.
`apt-get install rabbitmq-server` to installed RMQ Server on the Pi.
`service rabbitmq-server start` to start RMQ service.
`rabbitmq-plugins enable rabbitmq_management` to enable to Management UI plugin.
Management UI not accessible via guest account from any machine other than localhost. Create a new user account.
Basic Rabbit MQ Overview.
Basic terminology overview.
Create new Solution, with a project for Producing in. .NET Core 3.0.
Add NuGet package `RabbitMQ.Client`

Wrote base connection classes and unit tests. XUnit - because of Facts and Theories.
Architectured code.

BasicConnectionFactory
SslConnectionFactory

TLS - 2 purposes, for encrypting traffic and authenticating with the server.

# 1st - Enable TLS on RabbitMQ Server for encrypted connection.
Used docs for this.
Chose to manually generate self signed certs following documentation.
## Create the demo Certificate Authority
`mkdir democa`...

## Create OpenSSL config file

## Generate the key and certificates that our test Certificate Authority will use

openssl req -x509 -config openssl.cnf -newkey rsa:2048 -days 365 -out ca_certificate.pem -outform PEM -subj /CN=MyDemoCA/ -nodes

This creates a CA file in 2 formats PEM and DER for demo purposes.

## Now need to generate private keys and certs for client and server using the Demo CA

### Server

openssl req -new -key private_key.pem -out req.pem -outform PEM -subj /CN=$(hostname)/O=server/ -nodes

cd ../testca

openssl ca -config openssl.cnf -in ../server/req.pem -out ../server/server_certificate.pem -notext -batch -extensions server_ca_extensions

cd ../server
openssl pkcs12 -export -out server_certificate.p12 -in server_certificate.pem -inkey private_key.pem -passout pass:MySecretPassword

### Client


openssl genrsa -out private_key.pem 2048
openssl req -new -key private_key.pem -out req.pem -outform PEM -subj /CN=$(hostname)/O=client/ -nodes

cd ../testca
openssl ca -config openssl.cnf -in ../client/req.pem -out ../client/client_certificate.pem -notext -batch -extensions client_ca_extensions

cd ../client
openssl pkcs12 -export -out client_certificate.p12 -in client_certificate.pem -inkey private_key.pem -passout pass:MySecretPassword

Now certs and private keys have been generated, we can enable SSL on the RabbitMQ server and ensure traffic is encrypted.

# Enable TLS on Rabbit MQ
Need to tell RabbitMQ about location of CA bundle, server cert and private key.

Transferred the files over to the server in the home directory.
Needed to update the config file to point RMQ at the files. Needed to create a rabbitmq.conf file as it didn't exist.
Copied the example config and removed a load of stuff I didn't need. All commented out anyway.

Set up VS Code Remote SSH onto Raspberry Pi. Had to enable SSH on the Pi:

https://www.raspberrypi.org/documentation/remote-access/ssh/  -- step 2 using raspi-config.

Installed Remote Development extension to VS Code.
https://code.visualstudio.com/docs/remote/ssh

Connected in VS Code to pi@192.168.x.x with username and password as default (pi and raspberry).

Allowed me to edit the RMQ config file in VS Code remotely!.

Added the SSL config and then restarted the broker using

`sudo service rabbitmq-server restart`

Then re-ran the producer. It still worked because TCP (Non-ssl) was still enabled.

With TCP disabled using `listeners.tcp  = none`, I then got an error when trying to produce over TCP:

"Unhandled exception. RabbitMQ.Client.Exceptions.BrokerUnreachableException: None of the specified endpoints were reachable".

openssl x509 -outform der -in ca_certificate.pem -out ca_certificate.der
sudo certmgr -add -c Trust ca_certificate.cer
certmgr -list -c Root

https://www.sslshopper.com/article-most-common-openssl-commands.html

When peer verification is enabled, it is common for clients to also check whether the the hostname of the server they are connecting to matches one of two fields in the server certificate: the SAN (Subject Alternative Name) or CN (Common Name). When wildcard certificates are used, the hostname is matched against a pattern. If there is no match, peer verification will also be failed by the client. Hostname checks are also optional and generally orthogonal to certificate chain verification performed by the client.

* NEED TO REGEN CLIENT AND SERVER CERTS/KEYS USING THE RASPBERRY PI HOSTNAME *

Common errors, need to make sure certs are correct.
Need to make sure the CN is set to the hostname of the server on which Rabbit MQ is running. Need to make sure the server name property on the Connection Factory is set to the same CN (hostname).
Peer verification is ... and to be performed you need to generate a client certificate using the same CA as the server one, and ensure that the CA is trusted on the client machine. (how?)
The remote certificate is invalid according to the validation procedure. Can mean a lot of things. Steps to debug SSL in documentation.

sudo rabbitmqctl stop
sudo service rabbitmq-server start

# Client Certificate Authentication

1. Added auth backend and mechanisms to config.
2. Enabled SSL auth mechanism plugin `rabbitmq-plugins enable rabbitmq_auth_mechanism_ssl`
3. Restart server.
4. Added SSL auth user to Rabbit MQ.

openssl s_server -accept 8443 -cert server/server_certificate.pem -key server/private_key.pem -CAfile democa/ca_certificate.pem

openssl s_client -connect localhost:8443 -cert client/client_certificate.pem -key client/private_key.pem -CAfile democa/ca_certificate.pem -verify 8

openssl s_client -verify_hostname raspberrypi  -connect raspberrypi

openssl s_client -connect raspberrypi:5671 -cert client/client_certificate.pem -key client/private_key.pem -CAfile democa/ca_certificate.pem


Can also be configured for permissions - what clients can do once authenticated.