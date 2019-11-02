import typer
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from pathlib import Path
from .utils import load_case_from_yaml
from .core.engine import RuleEngine
from .core.types import Severity
from .rules.common import EfficiencyBoundsRule, AbsoluteTemperaturePositivityRule
from .rules.order_of_magnitude import OrderOfMagnitudeRule
from .rules.fluid import LowMachIncompressibleRule, AbsolutePressurePositivityRule

app = typer.Typer(help="Physics Sanity Check CLI")
console = Console()

def get_engine() -> RuleEngine:
    engine = RuleEngine()
    engine.register_rule(EfficiencyBoundsRule())
    engine.register_rule(AbsoluteTemperaturePositivityRule())
    engine.register_rule(OrderOfMagnitudeRule())
    engine.register_rule(LowMachIncompressibleRule())
    engine.register_rule(AbsolutePressurePositivityRule())
    return engine

@app.command()
def check(case_file: str, fail_on: str = "FAIL"):
    """
    Run sanity checks against a case defined in a YAML file.
    """
    console.print(f"[bold blue]Loading case from {case_file}...[/bold blue]")
    try:
        ctx, quantities = load_case_from_yaml(case_file)
    except Exception as e:
        console.print(f"[bold red]Error loading case: {e}[/bold red]")
        raise typer.Exit(code=1)
        
    engine = get_engine()
    report = engine.check(ctx, quantities)
    
    summary = report.summary()
    
    # Detail Panel
    for res in report.results:
        color = "green"
        if res.severity == Severity.INFO:
            color = "blue"
        elif res.severity == Severity.SUSPICIOUS:
            color = "yellow"
        elif res.severity == Severity.WARNING:
            color = "orange3"
        elif res.severity == Severity.FAIL:
            color = "red"
            
        if res.severity != Severity.PASS:
            panel = Panel(
                f"{res.message}\n\n[bold]Possible causes:[/bold]\n- " + "\n- ".join(res.possible_causes) if res.possible_causes else res.message,
                title=f"[{color}]{res.severity.value} - {res.rule_id}[/{color}]",
                border_style=color
            )
            console.print(panel)

    # Summary Table
    table = Table(title="Sanity Check Summary")
    table.add_column("Severity", justify="left", style="cyan", no_wrap=True)
    table.add_column("Count", justify="right", style="magenta")
    
    for sev, count in summary.items():
        if count > 0:
            table.add_row(sev.value, str(count))
            
    console.print(table)
    
    fail_sev = Severity(fail_on.upper())
    # Extremely simple threshold check for CI
    # If fail_on is WARNING, FAIL and WARNING cause exit code 1
    levels = [Severity.PASS, Severity.INFO, Severity.SUSPICIOUS, Severity.WARNING, Severity.FAIL]
    fail_idx = levels.index(fail_sev)
    
    has_failed = False
    for res in report.results:
        if levels.index(res.severity) >= fail_idx:
            has_failed = True
            break
            
    if has_failed:
        console.print(f"[bold red]Check failed because a result met or exceeded the {fail_on} threshold.[/bold red]")
        raise typer.Exit(code=1)

import importlib.util
from .core.metamorphic import UnitRoundtripTest, run_metamorphic_suite

@app.command()
def probe(model_file: str, function_name: str, config_file: str):
    """
    Run metamorphic probing on a model function.
    """
    console.print(f"[bold blue]Probing {function_name} in {model_file}...[/bold blue]")
    
    # Load function
    spec = importlib.util.spec_from_file_location("probe_module", model_file)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    model_func = getattr(module, function_name)
    
    # Load base inputs
    ctx, quantities = load_case_from_yaml(config_file)
    
    # Run tests
    # Default to changing all inputs that have 'm' to 'mm', 'kg' to 'g', etc.
    target_units = {}
    for name, q in quantities.items():
        if str(q.dimensionality) == "[length]":
            target_units[name] = "mm" if q.unit == "meter" else "m"
            
    tests = [UnitRoundtripTest(target_units=target_units)]
    
    results = run_metamorphic_suite(model_func, quantities, tests)
    
    for res in results:
        color = "green" if res.severity == Severity.PASS else "red"
        console.print(f"[{color}]{res.severity.value}[/{color}] - {res.message}")

if __name__ == "__main__":
    app()
