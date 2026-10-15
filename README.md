# Aurelia Sanctuaries

A premium architectural real-estate website concept built with React, TypeScript, Vite, Tailwind CSS, and Lucide icons.

## Run on your computer

1. Install [Node.js LTS](https://nodejs.org/).
2. Extract this project folder.
3. Open a terminal in the project folder and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite (usually `http://localhost:5173`).

## Publish it on GitHub so you can open it anywhere

1. Sign in to [GitHub](https://github.com/) and create a **new repository** (for example, `aurelia-sanctuaries`).
2. Upload the **contents of this folder** to the repository root—not the ZIP file itself. Make sure `.github/workflows/deploy.yml` is included.
3. Commit the files to the `main` branch.
4. In the repository, open **Settings → Pages**. Under **Build and deployment**, select **GitHub Actions** as the source.
5. Open the **Actions** tab and wait for **Deploy Aurelia to GitHub Pages** to finish successfully.
6. Open **Settings → Pages** to find your live website URL. It will generally look like `https://YOUR-USERNAME.github.io/REPOSITORY-NAME/`.

Every push to `main` will automatically rebuild and redeploy the site. You can open the published URL from your phone or any computer.

## Notes

- This is a front-end demo with sample property listings. It does not connect to a real property database.
- The viewing-request form currently shows a local confirmation only; it does not send email or save leads to a server.
- Property photos are loaded from Unsplash, so an internet connection is needed for those images.
- Prices, addresses, architect names, and property details are illustrative demo content and should be replaced with verified information before commercial use.
