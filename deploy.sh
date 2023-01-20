pnpm install
pnpm generate
commit_msg=$(git log --format=reference -1)
cd dist || exit
git init
git config --local user.email "action@github.com"
git config --local user.name "GitHub Action"
printf ".DS_Store\n" > .gitignore
touch .nojekyll
git add -A
git commit -m "$commit_msg"
git push -f git@github.com:Machine-Maker/terraria-npc-happiness.git HEAD:gh-pages
