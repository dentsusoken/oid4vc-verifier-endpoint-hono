FROM mcr.microsoft.com/devcontainers/typescript-node:20-bullseye

RUN apt-get update && apt-get install -y \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN architecture=$(uname -m) && \
    if [ "$architecture" = "x86_64" ]; then \
    curl -L "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"; \
    else \
    curl -L "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"; \
    fi && \
    unzip awscliv2.zip && \
    ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli --update && \
    rm -rf awscliv2.zip aws

RUN architecture=$(uname -m) && \
    if [ "$architecture" = "x86_64" ]; then \
    curl -L "https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-x86_64.zip" -o "aws-sam-cli.zip"; \
    else \
    curl -L "https://github.com/aws/aws-sam-cli/releases/latest/download/aws-sam-cli-linux-arm64.zip" -o "aws-sam-cli.zip"; \
    fi && \
    unzip aws-sam-cli.zip -d sam-installation && \
    ./sam-installation/install && \
    rm -rf sam-installation aws-sam-cli.zip

RUN npm install -g aws-cdk

WORKDIR /workspace

# Dockerクライアントのインストール
# RUN apt-get update && \
#     apt-get install -y \
#     apt-transport-https \
#     ca-certificates \
#     curl \
#     gnupg \
#     lsb-release && \
#     curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg && \
#     echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
#     apt-get update && \
#     apt-get install -y docker-ce-cli

# Dockerグループの作成とユーザーの追加
# RUN groupadd -g 999 docker && \
#     usermod -aG docker node
# RUN groupadd -g 999 docker
# RUN usermod -aG docker node