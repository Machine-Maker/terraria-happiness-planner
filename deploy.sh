pnpm install
pnpm generate
cd dist || exit
git init
printf ".DS_Store\n" > .gitignore
touch .nojekyll
git add -A
git commit -m "deployed: $(date)}"
git push -f git@github.com:Machine-Maker/terraria-npc-happiness.git HEAD:gh-pages
