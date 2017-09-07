Vagrant.configure("2") do |config|
  config.vm.box = "bento/ubuntu-16.04"

  config.vm.network "forwarded_port", guest: 3000, host: 3000

  config.vm.provision "shell", inline: <<-SHELL
    curl -sL https://deb.nodesource.com/setup_6.x | bash -
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
    echo "deb https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list
    apt-get update
    apt-get install -y build-essential nodejs yarn
  SHELL

  config.vm.provision "shell", privileged: false, inline: <<-SHELL
    ln -s /vagrant /home/vagrant/app
    echo "cd ~/app" >> /home/vagrant/.bashrc
  SHELL
end
