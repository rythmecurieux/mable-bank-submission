using FluentAssertions;
using Xunit;
using MableBank.Application;
using MableBank.Domain;
using MableBank.Domain.Errors;
using NetArchTest.Rules;

namespace MableBank.Architecture.Tests;

public sealed class AssemblyLayeringTests
{
    [Fact]
    public void Domain_assembly_does_not_reference_application_infrastructure_or_cli()
    {
        var result = Types.InAssembly(typeof(Money).Assembly)
            .Should()
            .NotHaveDependencyOn("MableBank.Application")
            .And()
            .NotHaveDependencyOn("MableBank.Infrastructure")
            .And()
            .NotHaveDependencyOn("MableBank.Cli")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Application_assembly_does_not_reference_infrastructure_or_cli()
    {
        var result = Types.InAssembly(typeof(ProcessDay).Assembly)
            .Should()
            .NotHaveDependencyOn("MableBank.Infrastructure")
            .And()
            .NotHaveDependencyOn("MableBank.Cli")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Infrastructure_assembly_does_not_reference_cli()
    {
        var result = Types.InAssembly(typeof(MableBank.Infrastructure.CsvAccountBalanceReader).Assembly)
            .Should()
            .NotHaveDependencyOn("MableBank.Cli")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Domain_errors_inherit_domain_exception()
    {
        var concreteErrors = Types.InAssembly(typeof(DomainException).Assembly)
            .That()
            .ResideInNamespace("MableBank.Domain.Errors")
            .And()
            .AreClasses()
            .And()
            .AreNotAbstract()
            .GetTypes();

        concreteErrors.Should().NotBeEmpty();
        foreach (var errorType in concreteErrors)
        {
            errorType.Should().BeAssignableTo<DomainException>();
        }
    }

    [Fact]
    public void Domain_concrete_classes_are_sealed()
    {
        var unsealed = Types.InAssembly(typeof(Money).Assembly)
            .That()
            .ResideInNamespace("MableBank.Domain")
            .And()
            .AreClasses()
            .And()
            .AreNotAbstract()
            .And()
            .AreNotSealed()
            .GetTypes();

        unsealed.Should().BeEmpty(string.Join(", ", unsealed.Select(type => type.FullName)));
    }
}
