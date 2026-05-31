FROM mcr.microsoft.com/devcontainers/ruby:1-3.3-bookworm

# postCreateCommand runs as vscode; RVM gem dirs are root-owned in this image
RUN chown -R vscode:vscode /usr/local/rvm

# Install gems at image build time (outside the bind-mounted workspace).
# Rebuild the image only when Gemfile.lock changes; reopening the container is fast.
COPY Gemfile Gemfile.lock .ruby-version ./
RUN bundle config set --global path /home/vscode/.gem-bundle \
  && bundle install \
  && chown -R vscode:vscode /home/vscode/.gem-bundle
