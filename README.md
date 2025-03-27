# Random Group Generator

A powerful web application that allows you to randomly assign members to groups, designed and developed by **ProTech**.

## Features

- **Group Randomization**: Generate random groups from a list of members
- **Equal Distribution**: Option to ensure members are distributed equally across groups
- **Excel Import**: Import names directly from Excel (.xlsx, .xls) or CSV files
- **Smart Column Detection**: Automatically finds name columns in spreadsheets
- **Session Storage**: Your data is saved in the browser session
- **CSV Download**: Download the group assignments as a CSV file
- **Responsive Design**: Works on both desktop and mobile devices
- **Animations & Visual Feedback**: Smooth transitions and loading states
- **Donate Feature**: Support development through GCash donations
- **Social Media Integration**: Connect with us on various platforms

## How to Use

1. Enter the number of groups you want to create
2. Add your list of members (one per line) in the text area or import from Excel
3. Choose whether you want equal distribution of members 
4. Click "Generate Groups" to create random groups
5. View the results and download them as a CSV file if needed
6. Use "Clear All" to reset the form and results

### Excel Import Feature

1. Click the "Import from Excel" button
2. Select your Excel (.xlsx, .xls) or CSV file
3. The application will automatically detect columns containing names
4. Names will be populated in the text area
5. Proceed with group generation

## Getting Started

### Prerequisites

- Node.js (v12 or later)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/random-group-generator.git
   cd random-group-generator
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm start
   ```
   or
   ```
   npx parcel index.html
   ```

4. Open `http://localhost:1234` in your browser

### Building for Production

```
npm run build
```

or

```
npx parcel build index.html --public-url ./
```

The production files will be generated in the `dist` directory.

## Technologies Used

- TypeScript
- HTML5 & CSS3
- Parcel Bundler
- SheetJS (for Excel import)
- Font Awesome Icons

## Connect With Us

- Facebook: [ProTech](https://www.facebook.com/profile.php?id=61574105611075)
- YouTube: [GhostedPH](https://www.youtube.com/@ghostedph834)
- GitHub: [jericko12](https://github.com/jericko12)
- Instagram: [justcallme.eko](https://www.instagram.com/justcallme.eko/)

## Support Us

If you find this tool useful, consider buying us a coffee through the donation button in the application.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 

© 2025 Random Group Generator | Developed by ProTech 