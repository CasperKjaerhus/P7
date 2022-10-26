FROM rust:latest
# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

RUN apt-get update && apt-get upgrade && apt-get install -y pkg-config build-essential libudev-dev


# Install Solana CLI and set to use test-net (validator docker container)
RUN sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
ENV PATH="/root/.local/share/solana/install/active_release/bin:$PATH"
RUN solana config set --url http://test-net:8899
RUN solana-keygen new --no-bip39-passphrase --force -s

# Install nodev16 w/yarn through nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.2/install.sh | bash \
    && source ~/.bashrc \
    && nvm install node \
    && nvm use node \
    && corepack enable

# Install Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --locked --force \
    && avm install latest \
    && avm use latest

ENTRYPOINT ["tail", "-f", "/dev/null"]