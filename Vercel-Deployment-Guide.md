# Vercel Deployment Guide (Vercel හි Host කරන ආකාරය)

මචන්, ඔයාගේ Next.js project එක Vercel එකේ host කරන්න මේ steps ටික පිළිවෙලට කරන්න:

### පියවර 1: Vercel එකට Login වෙන්න
1. [Vercel.com](https://vercel.com) වෙබ් අඩවියට යන්න.
2. "Sign Up" ගිහින් **"Continue with GitHub"** තෝරලා ඔයාගේ GitHub account එකෙන් login වෙන්න.

### පියවර 2: Project එක Import කිරීම
1. Vercel Dashboard එකේ දකුණු පැත්තේ උඩ තියෙන **"Add New..."** button එක click කරලා **"Project"** තෝරන්න.
2. "Import Git Repository" කියන තැනින්, ඔයාගේ අලුත් GitHub repo එක වන `amika2005/OCR-Processer` හොයාගෙන එතන තියෙන **"Import"** button එක click කරන්න.
*(සමහරවිට Vercel එකට GitHub repositories read කරන්න access දෙන්න අහවි. ඒක allow කරන්න).*

### පියවර 3: Project Configuration සහ Environment Variables
1. "Configure Project" පිටුවේ **Framework Preset** එක **"Next.js"** විදිහට auto select වෙලා ඇති (නැත්නම් Next.js දෙන්න).
2. **Environment Variables**: මේක ගොඩක් වැදගත්. ඔයාගේ project එකේ `.env` හෝ `.env.local` file එකක තියෙන Supabase keys ඇතුළු database සම්බන්ධ දේවල් මෙතනට දෙන්න ඕනේ.
   - ඊතලේ (Dropdown) දිගහැරලා, Name (උදා: `NEXT_PUBLIC_SUPABASE_URL`) සහ Value (උදා: `https://...supabase.co`) එකින් එක paste කරලා **"Add"** කරන්න.

### පියවර 4: Deploy කිරීම!
1. ඔක්කොම හරි නම්, නිල් පාට **"Deploy"** button එක click කරන්න.
2. දැන් Vercel එකෙන් ඔයාගේ project එක build වෙලා deploy වෙනකන් විනාඩියක් දෙකක් වගේ බලන් ඉන්න.

### පියවර 5: Live URL එක ලබාගැනීම
- Deployment එක successful උනාම, ඔයාට අලුත් පිටුවක් එයි "Congratulations!" කියලා.
- එතනින් ඔයාට Vercel එකෙන් දීලා තියෙන Live URL එක බලාගන්න වගේම click කරලා වෙබ් අඩවියට යන්නත් පුළුවන් (උදා: `ocr-processer.vercel.app`).
- පස්සේ ඕනෙ නම් ඒකට ඔයාගේම custom domain එකක් (උදා: `amika.com`) connect කරන්නත් පුළුවන්.

මොනවා හරි අවුලක් ආවොත් (build errors වගේ), මට කියන්න මම fix කරලා දෙන්නම්!
