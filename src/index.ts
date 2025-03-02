import { waitForElm } from "./utils.ts";
import { Parser } from '@etothepii/satisfactory-file-parser';

console.log("Initializing Satisfactory Save Importer");

await waitForElm(".production-nav-tabs");

document.addEventListener("click", async (e: MouseEvent) => {
	if ((e.target as HTMLElement).textContent  === " Recipes") {
		const recipeContainer: Element = await waitForElm("div.col-md-10:nth-child(3)");

		const saveImporterLabel = document.createElement("label");
		saveImporterLabel.appendChild(document.createTextNode("Import recipes from save game "));

		const saveImporterInput = document.createElement("input");
		saveImporterInput.type = "file";
		saveImporterInput.accept = ".sav";

		saveImporterInput.addEventListener("change", async (event) => {
			const input = event.target as HTMLInputElement;
			
			if (!input.files) return;

			const file = input.files[0];

			const reader = new FileReader();

			reader.onload = async (loaded) => {
				parseSaveGame(loaded?.target?.result as ArrayBuffer);
			};

			reader.readAsArrayBuffer(file);
		});

		saveImporterLabel.appendChild(saveImporterInput);

		recipeContainer.children[0].insertAdjacentElement('afterend', saveImporterLabel)
		console.log("Recipes loaded!");
	}

	if ((e.target as HTMLElement).textContent  === " Machines") {
		const recipeContainer: Element = await waitForElm("div.col-md-10:nth-child(3)");

		const saveImporterLabel = document.createElement("label");
		saveImporterLabel.appendChild(document.createTextNode("Import recipes from save game "));

		const saveImporterInput = document.createElement("input");
		saveImporterInput.type = "file";
		saveImporterInput.accept = ".sav";

		saveImporterInput.addEventListener("change", async (event) => {
			const input = event.target as HTMLInputElement;
			
			if (!input.files) return;

			const file = input.files[0];

			const reader = new FileReader();

			reader.onload = async (loaded) => {
				parseSaveGame(loaded?.target?.result as ArrayBuffer);
			};

			reader.readAsArrayBuffer(file);
		});

		saveImporterLabel.appendChild(saveImporterInput);

		recipeContainer.children[0].insertAdjacentElement('afterend', saveImporterLabel)
		console.log("Recipes loaded!");
	}
});

function parseSaveGame(file: ArrayBuffer) {
	console.log(file)
	
	const save = Parser.ParseSave('Mi Casa', file)

	const objects = save.levels.flatMap(level => level.objects);

	const progression = objects.find(obj => obj.typePath === "/Game/FactoryGame/Schematics/Progression/BP_SchematicManager.BP_SchematicManager_C");

	const unlockedAlts = (progression?.properties.mPurchasedSchematics as any).values.filter((value: any) => value.pathName.startsWith("/Game/FactoryGame/Schematics/Alternate/"))

	const productionLines: string = localStorage.getItem("production1") ?? "";

	if (productionLines === "") {
		console.error("No production lines found")
		return;
	}

	let productionLinesParsed = JSON.parse(productionLines);

	const activeLine = findActiveLine();

	productionLinesParsed[activeLine].request.allowedAlternateRecipes = unlockedAlts.map((alt: any) => alt.pathName.split("/").pop().split(".")[1].replace("Schematic", "Recipe"));

	localStorage.setItem("production1", JSON.stringify(productionLinesParsed));

	confirm("Recipes imported successfully!\nWould you like to refresh the page to see the changes?") && location.reload();
}

function findActiveLine (): number {
	const activeLine = document.querySelector(".nav-item.ng-scope.ui-sortable-handle:has(span.nav-link.active)");

	const indexOfActiveLine = Array.from(activeLine?.parentElement?.children ?? []).indexOf(activeLine as Element);

	return indexOfActiveLine - 1;
}