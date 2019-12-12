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

### Client Authentication in Rabbit MQ
There are two authentication mechanism options available in Rabbit MQ - basic username/password and certificate authentication. Basic authentication is the default, but is not the most secure of the two available options. In my opinion, certificate authentication is recommended for a few reasons:

- It separates out the responsibility of authentication from the client connection code, meaning clients can be updated to use new authentication credentials transparently, without any need for a re-deploy of the application.
- For enhanced security, and similar to how a policy can be set which requires a user's password to be changed regularly, certificates can be set with short expiry dates and regularly regenerated and reissued. This helps ensure that only clients who should be able to, can connect to the Rabbit MQ server. This again is a transparent process, assuming the certificates are stored in the same location on the client's machine, are generated using the same trusted Certificate Authority (CA) and the private key password is unchanged.
- Many organisations already have their own internal CA, so being able to generate and manage certificates should not be a big undertaking and allows for these certificates to be centrally controlled by a dedicated Systems Administration team.

### SSL vs Peer Verification vs Client Certificate Authentication
Getting Rabbit MQ to work over SSL can be tricky, and it is not helped by a confusion of terminology. SSL, Peer Verification and Certificate Authentication are very similar, but play a different role in the configuration of SSL in Rabbit MQ.

#### SSL
Enabling SSL is allowing Rabbit MQ to accept connections on a secure port, ensuring traffic to and from the server is encrypted. Just like HTTPS, the server presents its certificate containing the public key which is used the initiate the TLS handshake. I won't be going into any detail into SSL any further in this post, but there are plenty of resources online to help, including this [YouTube][ssl-youtube-video-url] video.

The exact server configuration required will be described later, but in short, SSL is enabled on Rabbit MQ by setting the desired port and pointing it to a pair of public and private key files, and a Certificate Authority file which signed the certificate/key pair. For a trusted connection to be established, the client applications will need to trust the same Certificate Authority.

#### Peer Verification
Peer Verification builds on top of SSL, and is a way for Rabbit MQ to verify that the clients which are attempting to connect can be trusted, that is -- they present a certificate which is signed by a Certificate Authority which the server also trusts. This helps ensure that only trusted clients can connect to the broker and helps prevent against Man-in-the-Middle attacks.

If the client is not able to supply a trusted certificate, then the server will reject the connection. The exception to this is if the `fail_if_no_peer_cert`{:.code-inline} configuration option is set to `verify_none`{:.code-inline}, in which case, the server will allow the connection.

Peer Verification is not required in order to use SSL, but it is highly recommended, at least in production environments.

#### Client Certificate Authentication
SSL can also be used as a mechanism for clients to authenticate with the broker instead of the default username and password mechanism. In order for clients to authenticate with SSL, they must present a certificate to the server which is signed by a trusted CA and which contains the login username as the Common Name (CN) or Subject Alternative Name (SAN). More details on how to configure this later.

## Technical Implementation
I installed Rabbit MQ Server on Raspbian, a Linux distro for the Raspberry Pi, but the process shouldn't be too dissimilar for other distros or even for Windows.

### Rabbit MQ Server Installation
As previously mentioned, I installed Rabbit MQ Server on a Raspberry Pi 2 running a new installation of Raspbian (kernel version 4.19).

I ran the following commands to install Rabbit MQ, enable the Management UI plugin and start the service:

{:.code-block}
```
> apt-get install rabbitmq-server
> rabbitmq-plugins enable rabbitmq_management
> service rabbitmq-server start
```

### Enabling SSL

#### Creating the Certificates
The first step to enabling SSL is to create the required certificate files that will be used on both the server and client machines. I followed the [Rabbit MQ documentation][rabbitmq-generating-certs] on how to generate the required certificates using OpenSSH. I will not replicate the steps here as it is clearly described in the documentation, but I will highlight a few things which didn't seem obvious to me.

- The step to generate a client certificate is only required if you want to use Peer Verification. It is also required if you plan on using certificates for client authentication.
- The CA file, which is used to self-sign the certificates, needs to be in the `.pem`{:.code-inline} format for Rabbit MQ.
- The Common Name of the Server certificate must be set to the name of the host machine on which the broker will be running. The documentation states to use `$(hostname)`{:.code-inline}, but this should only be used if the machine you are generating the certificate is the same machine on which the broker will be running on.
- The Common Name of the client certificate can be set to any arbitrary value, unless you are using the certificate for client authentication (explained later).
- The passwords used to protect the server and client private keys can, and should, be different.
- Although it is common to do it this way, the server and client certificates do not have to be signed by the same CA. They can be different, as long as they are both are trusted by the server and the client.

After following the guide, you should have the following files available:
- A CA file in the `.pem`{:.code-inline} format.
- A certificate/key pair for the server in the `.pem`{:.code-inline}, signed by the CA, whose Common Name value is set to the hostname of the machine Rabbit MQ will be running on. 
- A certificate/key pair for each client, signed by the CA. The format depends on the client-specific implementation.

Bear in mind, some of the most common SSL issues come about due to errors in the certificates, so it's worth taking care in this area to minimise any troubleshooting you may have to do.

#### Enabling SSL in Rabbit MQ

SSL is enabled in the Rabbit MQ configuration file, typically located in the `/etc/rabbitmq`{:.code-inline} directory on Linux. The `rabbitmq.conf`{:.code-inline} did not exist after my installation, so I created it, and added the following lines to enable SSL:

{:.code-block}
```
listeners.ssl.default               = 5671
ssl_options.cacertfile              = /etc/rabbitmq/ssl/ca_certificate.pem
ssl_options.certfile                = /etc/rabbitmq/ssl/server_certificate.pem
ssl_options.keyfile                 = /etc/rabbitmq/ssl/private_key.pem
ssl_options.password                = SuperSecretPassword123
```

The above config sets the SSL port (5671 is the default), and tells the broker where to find the cert files. Obviously this assumes that the cert files from the previous step have been transferred to the server. I chose to place my cert files in a new `ssl`{:.code-inline} directory.

If you also want to enable [Peer Verification](#peer-verification), add the following lines too:

{:.code-block}
```
ssl_options.verify                  = verify_peer
ssl_options.fail_if_no_peer_cert    = false
```

You'll want to restart the broker service at this point, and after any change to the config file. Now, RabbitMQ is set up to accept secure connections and transmit data in encrypted form to any clients which connect via this SSL port. If you want to disable non-SSL connections, this can be done with the following entry:

{:.code-block}
```
listeners.tcp = none
```

As an aside -- I chose this as an opportunity to give [Remote Development using SSH in VS Code][remote-development-using-ssh-in-vs-code] a try, and overall it worked pretty well. I had some issues in connecting at times, but it was great to be able to edit files on a remote server in a familiar development environment. I used [this guide][raspberry-pi-ssh-guide] to assist with enabling SSH on my Raspberry Pi.

#### Client Connections via SSL

Now that SSL is setup on the broker, we need to create a client which will connect via SSL so it can securely produce and consume from the message queues.

I chose to create a .NET client application -- a .NET Core 3.0 Console Application along with a supporting .NET Standard 2.1 class library. The full client code is available on my GitHub page, but as an overview:

- I created a generic...
- Add NuGet package `RabbitMQ.Client`

Because we have enabled [Peer Verification](#peer-verification), we need to ensure the certificates are installed and available on the client machine.


[rabbitmq-url]: https://www.rabbitmq.com/getstarted.html
[ssl-youtube-video-url]: https://youtu.be/T4Df5_cojAs
[rabbitmq-generating-certs]: https://www.rabbitmq.com/ssl.html#manual-certificate-generation
[remote-development-using-ssh-in-vs-code]: https://code.visualstudio.com/docs/remote/ssh
[raspberry-pi-ssh-guide]: https://www.raspberrypi.org/documentation/remote-access/ssh/

Wrote base connection classes and unit tests. XUnit - because of Facts and Theories.
Architectured code.

BasicConnectionFactory
SslConnectionFactory

TLS - 2 purposes, for encrypting traffic and authenticating with the server.

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