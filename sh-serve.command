# Local variables
LOCAL_SERVER_PORT=2000

bundle exec jekyll clean

open -a /Applications/Google\ Chrome.app http://localhost:$LOCAL_SERVER_PORT

bundle exec jekyll serve --strict_front_matter --port $LOCAL_SERVER_PORT